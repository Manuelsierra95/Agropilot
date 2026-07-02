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
import { primaryKeyField } from "../helper"
import { campaigns } from "./campaign"

// Tables

export const parcels = pgTable(
  "parcels",
  {
    id: primaryKeyField(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),

    // TODO: Add more crop types as needed
    cropType: text("crop_type", {
      enum: ["olive"],
    }).notNull(),
    irrigationType: text("irrigation_type", {
      enum: ["dryland", "irrigated"],
    }),
    areaM2: integer("area_m2"),
    centroid: geometry("centroid"), // Centroid point of the parcel (lat/lng fast querys)
    polygon: geometryPolygon("polygon"), // Full polygon geometry
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("parcels_organization_id_idx").on(table.organizationId)]
)

export const parcelCrops = pgTable("parcel_crops", {
  id: primaryKeyField(),
  parcelId: text("parcel_id")
    .notNull()
    .unique()
    .references(() => parcels.id, { onDelete: "cascade" }),
  variety: text("variety"),
  soilType: text("soil_type"),
  plantingDate: timestamp("planting_date"),
  plantCount: integer("plant_count"),
  data: jsonb("data").notNull(), // TODO: Añadir en aceite un esquema que añada el tipo de cultivo (intensivo, superintensivo, tradicional)
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
  data: jsonb("data").notNull().default({}),
  metrics: jsonb("metrics").notNull(),
  risks: jsonb("risks").notNull(),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  algorithmVersion: text("algorithm_version").notNull(),
})

export const parcelCropSeasons = pgTable(
  "parcel_crop_seasons",
  {
    id: primaryKeyField(),
    parcelId: text("parcel_id")
      .notNull()
      .references(() => parcels.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    yieldActualKg: numeric("yield_actual_kg", { precision: 12, scale: 2 }),
    yieldTargetKg: numeric("yield_target_kg", { precision: 12, scale: 2 }),
    expectedYieldKg: numeric("expected_yield_kg", { precision: 12, scale: 2 }),
    targetPricePerKg: numeric("target_price_per_kg", {
      precision: 10,
      scale: 2,
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("parcel_crop_season_unique").on(table.parcelId, table.campaignId),
  ]
)

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

  crop: one(parcelCrops, {
    fields: [parcels.id],
    references: [parcelCrops.parcelId],
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
