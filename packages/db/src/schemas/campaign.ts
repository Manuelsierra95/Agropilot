import {
  pgTable,
  text,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { primaryKeyField } from "../helper"

export const campaigns = pgTable(
  "campaigns",
  {
    id: primaryKeyField(),
    name: text("name").notNull().unique(), // "2025/2026"
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isActive: boolean("is_active").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("campaigns_is_active_idx").on(table.isActive)]
)
