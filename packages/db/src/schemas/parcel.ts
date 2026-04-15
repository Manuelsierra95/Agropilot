import { relations } from "drizzle-orm"
import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { teams } from "./auth"

export const parcels = pgTable("parcels", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cropType: text("crop_type").notNull(),
  location: json("location").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const parcelsRelations = relations(parcels, ({ one }) => ({
  team: one(teams, {
    fields: [parcels.teamId],
    references: [teams.id],
  }),
}))
