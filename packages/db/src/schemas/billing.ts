import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { organizations } from "./auth"

// Tables

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: "cascade" }),

  // Stripe
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),

  status: text("status", {
    enum: ["active", "trialing", "past_due", "canceled", "unpaid"],
  })
    .notNull()
    .default("active"),

  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  trialEndsAt: timestamp("trial_ends_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const planLimits = pgTable("plan_limits", {
  id: text("id").primaryKey(),
  plan: text("plan", {
    enum: ["free", "pro", "enterprise"],
  })
    .notNull()
    .unique(),

  maxMembers: integer("max_members").notNull(), // -1 = unlimited
  maxParcels: integer("max_parcels").notNull(), // -1 = unlimited
  maxStorage: integer("max_storage_mb").notNull(), // -1 = unlimited

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// Premium modules available for purchase
export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  slug: text("slug", {
    enum: ["ai-analysis", "field-notebook", "automations"],
  })
    .notNull()
    .unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["available", "coming_soon", "deprecated"],
  })
    .notNull()
    .default("available"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// Which modules each organization has unlocked
export const organizationModules = pgTable(
  "organization_modules",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    stripeSubscriptionItemId: text("stripe_subscription_item_id"), // For tracking which subscription item corresponds to this module for billing
    active: boolean("active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("org_module_unique").on(table.organizationId, table.moduleId),
  ]
)

// Relations

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}))

export const modulesRelations = relations(modules, ({ many }) => ({
  organizationModules: many(organizationModules),
}))

export const organizationModulesRelations = relations(
  organizationModules,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationModules.organizationId],
      references: [organizations.id],
    }),
    module: one(modules, {
      fields: [organizationModules.moduleId],
      references: [modules.id],
    }),
  })
)
