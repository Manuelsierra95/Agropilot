import { createSelectSchema } from "drizzle-zod"
import { planLimits, modules, organizationModules } from "@workspace/db/schemas"
import z from "zod"

export const planLimitsSchema = createSelectSchema(planLimits)
export const moduleSchema = createSelectSchema(modules)
export const organizationModuleSchema = createSelectSchema(organizationModules)

export type AuthPlanLimits = ReturnType<typeof planLimitsSchema.parse>
export type AuthModule = ReturnType<typeof moduleSchema.parse>
export type AuthOrganizationModule = ReturnType<
  typeof organizationModuleSchema.parse
>

export const toggleModuleSchema = z.object({
  active: z.boolean(),
})

export const slugSchema = moduleSchema.shape.slug

export type ToggleModuleInput = z.infer<typeof toggleModuleSchema>
