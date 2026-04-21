import { relations } from "drizzle-orm"
import { customType, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { organizations } from "./auth"

// Custom PostGIS types

const geometry = (name: string, options = {}) =>
  customType<{ data: string }>({
    dataType() {
      return "geometry(Point, 4326)"
    },
  })(name, options)

const geometryPolygon = (name: string, options = {}) =>
  customType<{ data: string }>({
    dataType() {
      return "geometry(Polygon, 4326)"
    },
  })(name, options)

// Schema

export const parcels = pgTable("parcels", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // Basic info
  name: text("name").notNull(),
  cropType: text("crop_type").notNull(),

  // Catastro
  refcat: text("refcat"),

  // Dir Metadata
  province: text("province"),
  municipality: text("municipality"),
  streetType: text("street_type"),
  streetName: text("street_name"),
  streetNumber: text("street_number"),

  // Geometry PostGIS
  centroid: geometry("centroid"), // Centroid point of the parcel (lat/lng fast querys)
  polygon: geometryPolygon("polygon"), // Full polygon geometry

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const parcelsRelations = relations(parcels, ({ one }) => ({
  organization: one(organizations, {
    fields: [parcels.organizationId],
    references: [organizations.id],
  }),
}))
