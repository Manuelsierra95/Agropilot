import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core"
import { organizations } from "./auth"
import { parcels } from "./parcel"
import { relations } from "drizzle-orm"
import { primaryKeyField } from "../helper"

export const tasks = pgTable(
  "tasks",
  {
    id: primaryKeyField(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parcelId: text("parcel_id").references(() => parcels.id, {
      onDelete: "cascade",
    }),
    taskType: text("task_type", {
      enum: ["manual", "recommended", "automated"],
    }).notNull(),
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    status: text("status", {
      enum: ["pending", "in_progress", "done", "skipped"],
    }).notNull(),
    priority: integer("priority").default(0).notNull(), // 0–3
    source: text("source", {
      enum: ["manual", "weather", "risk_engine", "market", "sensor"],
    }).notNull(),
    sourceId: text("source_id"), // ID from the source system (e.g., weather event ID, risk engine alert ID)

    // Additional metadata for extensibility (e.g., weather conditions at the time of task creation, risk scores, etc.)
    meta: jsonb("meta"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tasks_organization_id_idx").on(table.organizationId),
    index("tasks_org_start_date_idx").on(table.organizationId, table.startDate),
    index("tasks_org_parcel_idx").on(table.organizationId, table.parcelId),
    index("tasks_org_status_idx").on(table.organizationId, table.status),
  ]
)

export const taskRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),

  parcel: one(parcels, {
    fields: [tasks.parcelId],
    references: [parcels.id],
  }),
}))
