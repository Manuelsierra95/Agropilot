import z from "zod"
import {
  dashboardCampaignMarginSchema,
  dashboardFinanceResumeSchema,
  dashboardOlivePriceItemSchema,
  dashboardParcelFinanceComparisonItemSchema,
  dashboardParcelSellingWindowItemSchema,
  dashboardProductionValueSchema,
  dashboardSellingWindowSchema,
  dashboardTransactionSnapshotSchema,
} from "../finance/finance-dashboard"
import {
  dashboardCalendarEventSchema,
} from "../tasks/tasks-dashboard"
import {
  dashboardMapParcelSchema,
  dashboardOlivarSchema,
  dashboardParcelCropOverviewItemSchema,
  dashboardRecommendationSchema,
  dashboardRisksSchema,
} from "../parcel/parcel-dashboard"

export const dashboardOverviewRecommendationItemSchema =
  dashboardRecommendationSchema.extend({
    parcelId: z.string().uuid(),
    parcelName: z.string(),
  })

export const dashboardOverviewRiskItemSchema = z.object({
  parcelId: z.string().uuid(),
  name: z.string(),
  risks: dashboardRisksSchema,
})

export const dashboardOverviewSingleSchema = z.object({
  market: z.object({
    olivePrices: z.array(dashboardOlivePriceItemSchema),
    sellingWindow: dashboardSellingWindowSchema,
  }),
  crop: z.object({
    overview: dashboardOlivarSchema,
    productionValue: dashboardProductionValueSchema,
  }),
  finance: z.object({
    resume: dashboardFinanceResumeSchema,
    campaignMargin: dashboardCampaignMarginSchema,
    recentTransactions: z.array(dashboardTransactionSnapshotSchema),
  }),
  intelligence: z.object({
    recommendations: z.array(dashboardRecommendationSchema),
    risks: dashboardRisksSchema,
  }),
  operations: z.object({
    upcomingWeek: z.array(dashboardCalendarEventSchema),
    parcelsMap: z.array(dashboardMapParcelSchema),
  }),
})

export const dashboardOverviewAllSchema = z.object({
  market: z.object({
    olivePrices: z.array(dashboardOlivePriceItemSchema),
    allSellingWindows: z.array(dashboardParcelSellingWindowItemSchema),
  }),
  crop: z.object({
    allOverviews: z.array(dashboardParcelCropOverviewItemSchema),
    productionValue: dashboardProductionValueSchema,
  }),
  finance: z.object({
    comparison: z.object({
      parcels: z.array(dashboardParcelFinanceComparisonItemSchema),
    }),
    recentTransactions: z.array(dashboardTransactionSnapshotSchema),
  }),
  intelligence: z.object({
    allRecommendations: z.array(dashboardOverviewRecommendationItemSchema),
    allRisks: z.array(dashboardOverviewRiskItemSchema),
  }),
  operations: z.object({
    upcomingWeek: z.array(dashboardCalendarEventSchema),
    parcelsMap: z.array(dashboardMapParcelSchema),
  }),
})

export type DashboardOverviewRecommendationItem = z.infer<
  typeof dashboardOverviewRecommendationItemSchema
>
export type DashboardOverviewRiskItem = z.infer<
  typeof dashboardOverviewRiskItemSchema
>
export type DashboardOverviewSingle = z.infer<
  typeof dashboardOverviewSingleSchema
>
export type DashboardOverviewAll = z.infer<typeof dashboardOverviewAllSchema>
export type DashboardOverview = DashboardOverviewSingle | DashboardOverviewAll
