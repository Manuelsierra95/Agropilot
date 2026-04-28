import { createSelectSchema } from "drizzle-zod"
import {
  subscriptions,
  planLimits,
  modules,
  organizationModules,
} from "@workspace/db"
import z from "zod"

export const subscriptionSchema = createSelectSchema(subscriptions)
export const planLimitsSchema = createSelectSchema(planLimits)
export const moduleSchema = createSelectSchema(modules)
export const organizationModuleSchema = createSelectSchema(organizationModules)

export type AuthSubscription = ReturnType<typeof subscriptionSchema.parse>
export type AuthPlanLimits = ReturnType<typeof planLimitsSchema.parse>
export type AuthModule = ReturnType<typeof moduleSchema.parse>
export type AuthOrganizationModule = ReturnType<
  typeof organizationModuleSchema.parse
>

export const toggleModuleSchema = z.object({
  active: z.boolean(),
})

export const slugSchema = moduleSchema.shape.slug

export type BillingMeResponse = {
  subscription: {
    status: AuthSubscription["status"]
    stripePriceId: string | null
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    trialEndsAt: Date | null
  } | null // null for free plan
  limits: {
    maxParcels: number
    maxMembers: number
    maxStorageMb: number
    usedParcels: number
    usedMembers: number
    usedStorageMb: number
  }
  modules: BillingModuleItem[]
}

export type BillingModuleItem = {
  id: string
  slug: AuthModule["slug"]
  name: string
  description: string | null
  status: AuthModule["status"]
  active: boolean
}

export type ToggleModuleInput = {
  active: boolean
}
