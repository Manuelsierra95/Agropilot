import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core"
import { geometry } from "../utils/post-gis"
import { parcelStation } from "./parcel"

export const weatherStation = pgTable("weather_station", {
  id: text("id").primaryKey(),
  stationId: text("station_id").notNull().unique(),
  name: text("name").notNull(),
  location: geometry("location").notNull(),
  altitude: integer("altitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const weatherStationRelations = relations(
  weatherStation,
  ({ many }) => ({
    primaryForParcels: many(parcelStation),
  })
)
