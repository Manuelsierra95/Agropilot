import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  date,
  jsonb,
  numeric,
  index,
  unique,
  integer,
} from "drizzle-orm/pg-core"
import { organizations } from "./auth"
import { geometry, geometryPolygon } from "../utils/post-gis"
import { weatherStation } from "./weatherStation"
import { campaigns } from "./finance"
import { primaryKeyField } from "../helper"

// Tables

export const parcels = pgTable("parcels", {
  id: primaryKeyField(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cropType: text("crop_type").notNull(),
  irrigationType: text("irrigation_type", {
    enum: ["dryland", "irrigated"],
  }),
  areaHa: numeric("area_ha", { precision: 10, scale: 4 }), // Optional user-entered area in hectares
  areaM2: integer("area_m2"), // Reserved; not computed from geometry
  centroid: geometry("centroid"), // Centroid point of the parcel (lat/lng fast querys)
  polygon: geometryPolygon("polygon"), // Full polygon geometry
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const parcelLocation = pgTable("parcel_location", {
  id: primaryKeyField(),
  parcelId: text("parcel_id")
    .notNull()
    .unique()
    .references(() => parcels.id, { onDelete: "cascade" }),
  refcat: text("refcat"),
  province: text("province"),
  municipality: text("municipality"),
  streetType: text("street_type"),
  streetName: text("street_name"),
  streetNumber: text("street_number"),
  postalCode: text("postal_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const parcelStation = pgTable("parcel_station", {
  parcelId: text("parcel_id")
    .primaryKey()
    .references(() => parcels.id, { onDelete: "cascade" }),
  primaryStationId: text("primary_station_id")
    .notNull()
    .references(() => weatherStation.id),
  fallbackStations: jsonb("fallback_stations")
    .$type<{ stationId: string; distanceKm: number }[]>()
    .notNull(), // Array of weatherStation.id for fallback
  computedAt: timestamp("computed_at").defaultNow().notNull(),
})

export const parcelWeather = pgTable("parcel_weather", {
  id: primaryKeyField(),
  parcelId: text("parcel_id")
    .notNull()
    .references(() => parcels.id, { onDelete: "cascade" })
    .unique(),
  rangeStart: date("range_start").notNull(),
  rangeEnd: date("range_end").notNull(),
  status: text("status", {
    enum: ["ok", "no-data", "error"],
  }).notNull(),
  data: jsonb("data").notNull(),
  metrics: jsonb("metrics").notNull(),
  risks: jsonb("risks").notNull(),
  recommendations: jsonb("recommendations"),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  algorithmVersion: text("algorithm_version").notNull(),
})

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

    // Comparative metrics vs market
    avgMarketPrice: numeric("avg_market_price", {
      precision: 12,
      scale: 4,
    }),
    marginVsMarket: numeric("margin_vs_market", {
      precision: 12,
      scale: 4,
    }),

    // Proyections
    expectedYieldKg: numeric("expected_yield_kg", {
      precision: 12,
      scale: 2,
    }),
    expectedRevenue: numeric("expected_revenue", {
      precision: 12,
      scale: 2,
    }),
    expectedProfit: numeric("expected_profit", {
      precision: 12,
      scale: 2,
    }),

    calculationVersion: text("calculation_version").default("v1"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    parcelCampaignIdx: index("parcel_financial_campaign_idx").on(
      table.parcelId,
      table.campaignId
    ),

    uniqueParcelSeason: unique("parcel_financial_unique").on(
      table.parcelId,
      table.campaignId
    ),
  })
)

export const parcelCashflowDaily = pgTable("parcel_cashflow_daily", {
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
})

// Relations

export const parcelsRelations = relations(parcels, ({ one }) => ({
  organization: one(organizations, {
    fields: [parcels.organizationId],
    references: [organizations.id],
  }),

  weather: one(parcelWeather, {
    fields: [parcels.id],
    references: [parcelWeather.parcelId],
  }),

  station: one(parcelStation, {
    fields: [parcels.id],
    references: [parcelStation.parcelId],
  }),
}))

export const parcelStationRelations = relations(parcelStation, ({ one }) => ({
  parcel: one(parcels, {
    fields: [parcelStation.parcelId],
    references: [parcels.id],
  }),

  primaryStation: one(weatherStation, {
    fields: [parcelStation.primaryStationId],
    references: [weatherStation.id],
  }),
}))

export const parcelLocationRelations = relations(parcelLocation, ({ one }) => ({
  parcel: one(parcels, {
    fields: [parcelLocation.parcelId],
    references: [parcels.id],
  }),
}))

export const parcelWeatherRelations = relations(parcelWeather, ({ one }) => ({
  parcel: one(parcels, {
    fields: [parcelWeather.parcelId],
    references: [parcels.id],
  }),
}))
