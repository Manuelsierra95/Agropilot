import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  date,
  numeric,
  index,
} from "drizzle-orm/pg-core"
import { organizations } from "./auth"
import { parcels } from "./parcel"
import { campaigns } from "./campaign"
import { transactions } from "./finance"
import { primaryKeyField } from "../helper"

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/**
 * Cada entrega de cosecha a un destino (cooperativa, almacén, industria...).
 *
 * Generalización de oliveDeliveries → funciona para cualquier cultivo:
 *   - Aceituna → aceite:      rawUnit="kg",  processedUnit="l",  conversionRate=20.0
 *   - Uva → mosto/vino:       rawUnit="kg",  processedUnit="l",  conversionRate=70.0
 *   - Almendra en cáscara:    rawUnit="kg",  processedUnit="kg", conversionRate=40.0
 *   - Cereal (sin transform): rawUnit="kg",  processedUnit="kg", conversionRate=100.0
 *
 * Cuando no hay transformación (conversionRate = 100, misma unidad),
 * processedQuantity === rawQuantity y quantityRemaining refleja el stock bruto.
 *
 * Flujo de estados:
 *   "stored"  → todo el stock disponible
 *   "partial" → ventas parciales, aún queda stock
 *   "sold"    → quantityRemaining = 0
 */
export const harvestDeliveries = pgTable(
  "harvest_deliveries",
  {
    id: primaryKeyField(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parcelId: text("parcel_id")
      .notNull()
      .references(() => parcels.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),

    deliveryDate: date("delivery_date").notNull(),
    destinationName: text("destination_name"), // cooperativa, almazara, bodega...

    // --- Materia prima entregada ---
    rawQuantity: numeric("raw_quantity", { precision: 12, scale: 2 }).notNull(),
    rawUnit: text("raw_unit").notNull(), // "kg", "t", "caja"...

    // --- Transformación ---
    // Nullable: si el cultivo se vende sin transformar, dejar null
    // y usar processedQuantity = rawQuantity con la misma unidad.
    // Rango: 0.00 – 100.00 (ej: 20.00 → 20% de rendimiento aceite)
    conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }),

    // --- Producto resultante (stock que se vende) ---
    // = rawQuantity × conversionRate / 100  — calculado en app, guardado aquí.
    // Si no hay transformación: igual a rawQuantity.
    processedQuantity: numeric("processed_quantity", {
      precision: 12,
      scale: 2,
    }).notNull(),
    processedUnit: text("processed_unit").notNull(), // "l", "kg", "botella"...

    // Calidad del producto — texto libre para no acoplar al cultivo.
    // Aceite: "virgen_extra" | "virgen" | "lampante"
    // Vino:   "DO", "mesa", etc.
    // Cereal: "grado_1", "forrajero", etc.
    grade: text("grade"),

    // --- Estado del stock ---
    // quantityRemaining se actualiza con cada harvestSale.
    // Guardado denormalizado para queries rápidas (dashboard, alertas).
    quantityRemaining: numeric("quantity_remaining", {
      precision: 12,
      scale: 2,
    }).notNull(), // = processedQuantity en la inserción inicial
    status: text("status", {
      enum: ["stored", "partial", "sold"],
    })
      .notNull()
      .default("stored"),

    // --- Precio objetivo de venta (€/unidad de processedUnit) ---
    // Alerta cuando marketPrices.price >= targetSalePricePerUnit.
    targetSalePricePerUnit: numeric("target_sale_price_per_unit", {
      precision: 10,
      scale: 4,
    }),

    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("harvest_deliveries_org_idx").on(table.organizationId),
    index("harvest_deliveries_parcel_campaign_idx").on(
      table.parcelId,
      table.campaignId
    ),
    index("harvest_deliveries_org_status_idx").on(
      table.organizationId,
      table.status
    ),
  ]
)

/**
 * Cada venta (total o parcial) del stock de una entrega.
 *
 * La lógica de la aplicación al registrar una venta no cambia:
 *   1. Crear transaction(flow: "income", category: "sale", amount: totalAmount)
 *   2. Guardar harvestSale.transactionId = transaction.id
 *   3. harvestDeliveries.quantityRemaining -= quantitySold
 *   4. Actualizar harvestDeliveries.status
 */
export const harvestSales = pgTable(
  "harvest_sales",
  {
    id: primaryKeyField(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    deliveryId: text("delivery_id")
      .notNull()
      .references(() => harvestDeliveries.id, { onDelete: "restrict" }),
    parcelId: text("parcel_id")
      .notNull()
      .references(() => parcels.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),

    transactionId: text("transaction_id").references(() => transactions.id, {
      onDelete: "set null",
    }),

    saleDate: date("sale_date").notNull(),
    quantitySold: numeric("quantity_sold", {
      precision: 12,
      scale: 2,
    }).notNull(),
    pricePerUnit: numeric("price_per_unit", {
      precision: 10,
      scale: 4,
    }).notNull(),
    totalAmount: numeric("total_amount", {
      precision: 12,
      scale: 2,
    }).notNull(), // = quantitySold × pricePerUnit

    buyerName: text("buyer_name"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("harvest_sales_delivery_idx").on(table.deliveryId),
    index("harvest_sales_org_campaign_idx").on(
      table.organizationId,
      table.campaignId
    ),
  ]
)

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const harvestDeliveriesRelations = relations(
  harvestDeliveries,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [harvestDeliveries.organizationId],
      references: [organizations.id],
    }),
    parcel: one(parcels, {
      fields: [harvestDeliveries.parcelId],
      references: [parcels.id],
    }),
    campaign: one(campaigns, {
      fields: [harvestDeliveries.campaignId],
      references: [campaigns.id],
    }),
    sales: many(harvestSales),
  })
)

export const harvestSalesRelations = relations(harvestSales, ({ one }) => ({
  delivery: one(harvestDeliveries, {
    fields: [harvestSales.deliveryId],
    references: [harvestDeliveries.id],
  }),
  organization: one(organizations, {
    fields: [harvestSales.organizationId],
    references: [organizations.id],
  }),
  parcel: one(parcels, {
    fields: [harvestSales.parcelId],
    references: [parcels.id],
  }),
  campaign: one(campaigns, {
    fields: [harvestSales.campaignId],
    references: [campaigns.id],
  }),
  transaction: one(transactions, {
    fields: [harvestSales.transactionId],
    references: [transactions.id],
  }),
}))
