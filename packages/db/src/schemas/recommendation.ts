import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { organizations } from "./auth"
import { parcels } from "./parcel"
import { primaryKeyField } from "../helper"

export const recommendations = pgTable(
  "recommendations",
  {
    id: primaryKeyField(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parcelId: text("parcel_id").references(() => parcels.id, {
      onDelete: "cascade",
    }),
    dedupeKey: text("dedupe_key").notNull(),
    type: text("type", {
      enum: [
        "irrigation",
        "treatment",
        "fertilization",
        "inspection",
        "harvest",
        "sale",
        "general",
      ],
    }).notNull(),
    source: text("source", {
      enum: ["weather", "risk_engine", "market", "sensor", "copilot"],
    }).notNull(),
    title: text("title").notNull(),
    details: text("details").notNull(),
    priority: text("priority", {
      enum: ["low", "medium", "high"],
    }).notNull(),
    status: text("status", {
      enum: ["pending", "accepted", "dismissed", "expired"],
    }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    dismissedAt: timestamp("dismissed_at"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("recommendations_org_dedupe_key_unique").on(
      table.organizationId,
      table.dedupeKey
    ),
    index("recommendations_org_parcel_status_idx").on(
      table.organizationId,
      table.parcelId,
      table.status
    ),
    index("recommendations_org_status_expires_idx").on(
      table.organizationId,
      table.status,
      table.expiresAt
    ),
  ]
)

export const recommendationRelations = relations(
  recommendations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [recommendations.organizationId],
      references: [organizations.id],
    }),
    parcel: one(parcels, {
      fields: [recommendations.parcelId],
      references: [parcels.id],
    }),
  })
)
