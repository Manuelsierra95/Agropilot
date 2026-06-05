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
import { users } from "./auth"
import { jsonb } from "drizzle-orm/pg-core"
import { boolean } from "drizzle-orm/pg-core"
import { primaryKeyField } from "../helper"

// Tables

export const transactions = pgTable("transactions", {
  id: primaryKeyField(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  parcelId: text("parcel_id").references(() => parcels.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  concept: text("concept").notNull(),
  description: text("description"),
  flow: text("flow", {
    enum: ["income", "expense"],
  }).notNull(),
  date: date("date").notNull(),
  category: text("category", {
    enum: [
      "irrigation",
      "fertilization",
      "treatment",
      "labor",
      "machinery",
      "fuel",
      "harvest",
      "sale",
      "subsidy",
      "other",
    ],
  }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  meta: jsonb("meta"),
  paymentMethod: text("payment_method", {
    enum: ["transferencia", "tarjeta", "efectivo", "cheque", "otro"],
  }),
  invoiceNumber: text("invoice_number"),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const campaigns = pgTable("campaigns", {
  id: primaryKeyField(),
  name: text("name").notNull().unique(), // "2025/2026"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

export const marketPrices = pgTable(
  "market_prices",
  {
    id: primaryKeyField(),

    // For now we will only track olive oil prices, but this can be extended in the future
    product: text("product", {
      enum: ["olive_oil"],
    }).notNull(),

    market: text("market"),
    price: numeric("price", { precision: 12, scale: 4 }).notNull(),
    unit: text("unit").notNull(),
    date: date("date").notNull(),
    currency: text("currency").default("EUR"),
    source: text("source"), // scraping, API, manual, etc.
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    productDateIdx: index("market_prices_product_date_idx").on(
      table.product,
      table.date
    ),
  })
)

// Relations

export const transactionsRelations = relations(transactions, ({ one }) => ({
  organization: one(organizations, {
    fields: [transactions.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  parcel: one(parcels, {
    fields: [transactions.parcelId],
    references: [parcels.id],
  }),
}))
