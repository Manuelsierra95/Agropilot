import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  date,
  numeric,
  index,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { organizations } from "./auth"
import { parcels } from "./parcel"
import { users } from "./auth"
import { jsonb } from "drizzle-orm/pg-core"
import { primaryKeyField } from "../helper"
import { campaigns } from "./campaign"

// Tables

export const transactions = pgTable(
  "transactions",
  {
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
  },
  (table) => [
    index("transactions_organization_id_idx").on(table.organizationId),
    index("transactions_org_date_idx").on(table.organizationId, table.date),
    index("transactions_parcel_id_idx").on(table.parcelId),
    index("transactions_org_parcel_date_idx").on(
      table.organizationId,
      table.parcelId,
      table.date
    ),
  ]
)

export const marketPrices = pgTable(
  "market_prices",
  {
    id: primaryKeyField(),

    // For now we will only track olive oil prices, but this can be extended in the future
    product: text("product").notNull(),

    grade: text("grade").notNull(), // For now virgen_extra, virgen, lampante

    market: text("market"),
    price: numeric("price", { precision: 12, scale: 4 }).notNull(),
    unit: text("unit").notNull(),
    date: date("date").notNull(),
    currency: text("currency").default("EUR"),
    trend: text("trend", {
      enum: ["up", "down", "stable"],
    }),
    source: text("source"), // scraping, API, manual, etc.
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("market_prices_product_grade_date_idx").on(
      table.product,
      table.grade,
      table.date,
      table.market
    ),
  ]
)

export const parcelFinancialSummaries = pgTable(
  "parcel_financial_summaries",
  {
    id: primaryKeyField(),
    parcelId: text("parcel_id")
      .notNull()
      .references(() => parcels.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    totalIncome: numeric("total_income", { precision: 12, scale: 2 }).default(
      "0"
    ),
    totalExpense: numeric("total_expense", { precision: 12, scale: 2 }).default(
      "0"
    ),
    profit: numeric("profit", { precision: 12, scale: 2 }).default("0"),
    totalKg: numeric("total_kg", { precision: 12, scale: 2 }).default("0"),

    // KPIs
    costPerKg: numeric("cost_per_kg", { precision: 12, scale: 4 }),
    revenuePerKg: numeric("revenue_per_kg", { precision: 12, scale: 4 }),
    marginPerKg: numeric("margin_per_kg", { precision: 12, scale: 4 }),

    // Market comparison
    avgMarketPrice: numeric("avg_market_price", { precision: 12, scale: 4 }),
    marginVsMarket: numeric("margin_vs_market", { precision: 12, scale: 4 }),

    // Projected KPIs based on expected yield and market price
    expectedYieldKg: numeric("expected_yield_kg", { precision: 12, scale: 2 }),
    expectedRevenue: numeric("expected_revenue", { precision: 12, scale: 2 }),
    expectedProfit: numeric("expected_profit", { precision: 12, scale: 2 }),

    calculationVersion: text("calculation_version").default("v1"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("parcel_financial_unique").on(table.parcelId, table.campaignId),
    index("parcel_financial_campaign_only_idx").on(table.campaignId),
  ]
)

export const parcelCashflowDaily = pgTable(
  "parcel_cashflow_daily",
  {
    id: primaryKeyField(),
    parcelId: text("parcel_id")
      .notNull()
      .references(() => parcels.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    date: date("date").notNull(),
    income: numeric("income", { precision: 12, scale: 2 }).default("0"),
    expense: numeric("expense", { precision: 12, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("parcel_cashflow_parcel_campaign_date_idx").on(
      table.parcelId,
      table.campaignId,
      table.date
    ),
    index("parcel_cashflow_campaign_date_idx").on(table.campaignId, table.date),
  ]
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
  campaign: one(campaigns, {
    fields: [transactions.campaignId],
    references: [campaigns.id],
  }),
}))

export const parcelFinancialSummariesRelations = relations(
  parcelFinancialSummaries,
  ({ one }) => ({
    parcel: one(parcels, {
      fields: [parcelFinancialSummaries.parcelId],
      references: [parcels.id],
    }),
    campaign: one(campaigns, {
      fields: [parcelFinancialSummaries.campaignId],
      references: [campaigns.id],
    }),
  })
)

export const parcelCashflowDailyRelations = relations(
  parcelCashflowDaily,
  ({ one }) => ({
    parcel: one(parcels, {
      fields: [parcelCashflowDaily.parcelId],
      references: [parcels.id],
    }),
    campaign: one(campaigns, {
      fields: [parcelCashflowDaily.campaignId],
      references: [campaigns.id],
    }),
  })
)
