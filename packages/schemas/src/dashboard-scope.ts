import z from "zod"

export const dashboardScopeQuerySchema = z.object({
  parcelId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

export type DashboardScopeQuery = z.infer<typeof dashboardScopeQuerySchema>

/** @deprecated Use dashboardScopeQuerySchema */
export const dashboardOverviewQuerySchema = dashboardScopeQuerySchema

/** @deprecated Use DashboardScopeQuery */
export type DashboardOverviewQuery = DashboardScopeQuery

export const dashboardRecentTransactionsQuerySchema =
  dashboardScopeQuerySchema.extend({
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })

export type DashboardRecentTransactionsQuery = z.infer<
  typeof dashboardRecentTransactionsQuerySchema
>

export const dashboardUpcomingWeekQuerySchema = dashboardScopeQuerySchema.extend(
  {
    weekStart: z.string().date().optional(),
  }
)

export type DashboardUpcomingWeekQuery = z.infer<
  typeof dashboardUpcomingWeekQuerySchema
>
