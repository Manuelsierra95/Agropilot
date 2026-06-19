import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { primaryKeyField } from "../helper"

export const logs = pgTable(
  "logs",
  {
    id: primaryKeyField(),
    source: text("source", {
      enum: ["scraper", "api", "cron"],
    }).notNull(),
    action: text("action").notNull(),
    level: text("level", {
      enum: ["info", "warn", "error"],
    }).notNull(),
    message: text("message").notNull(),
    duration: integer("duration"), // ms
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("logs_source_idx").on(table.source),
    index("logs_source_action_idx").on(table.source, table.action),
    index("logs_source_created_idx").on(table.source, table.createdAt),
  ]
)
