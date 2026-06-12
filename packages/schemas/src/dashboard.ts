/**
 * @deprecated Import from finance-dashboard, parcel-dashboard, tasks-dashboard, or dashboard-scope.
 */
export {
  dashboardPricePointSchema,
  dashboardOlivePriceItemSchema,
  dashboardSellingWindowSchema,
  dashboardTransactionSnapshotSchema,
  dashboardFinanceResumeSchema,
  dashboardCampaignMarginPointSchema,
  dashboardCampaignMarginSchema,
  dashboardProductionValueSchema,
  DASHBOARD_OIL_GRADES,
  TRANSACTION_CATEGORY_LABELS,
  type DashboardOlivePriceItem,
  type DashboardCampaignMargin,
  type DashboardTransactionSnapshot,
} from "./finance-dashboard"

export {
  dashboardOlivarSchema,
  dashboardRiskDetailSchema,
  dashboardRisksSchema,
  dashboardRecommendationSchema,
  dashboardMapParcelSchema,
  type DashboardRisks,
  type DashboardRecommendation,
  type DashboardMapParcel,
} from "./parcel-dashboard"

export {
  dashboardCalendarEventSchema,
  type DashboardCalendarEvent,
} from "./tasks-dashboard"

export {
  dashboardScopeQuerySchema,
  dashboardOverviewQuerySchema,
  type DashboardScopeQuery,
  type DashboardOverviewQuery,
} from "./dashboard-scope"

import z from "zod"
import { dashboardOlivePriceItemSchema } from "./finance-dashboard"
import { dashboardSellingWindowSchema } from "./finance-dashboard"
import { dashboardFinanceResumeSchema } from "./finance-dashboard"
import { dashboardCampaignMarginSchema } from "./finance-dashboard"
import { dashboardProductionValueSchema } from "./finance-dashboard"
import { dashboardOlivarSchema } from "./parcel-dashboard"
import { dashboardRecommendationSchema } from "./parcel-dashboard"
import { dashboardRisksSchema } from "./parcel-dashboard"
import { dashboardMapParcelSchema } from "./parcel-dashboard"
import { dashboardCalendarEventSchema } from "./tasks-dashboard"

/** @deprecated Use slice endpoints instead of monolithic overview */
export const dashboardOverviewSchema = z.object({
  olivePrices: z.array(dashboardOlivePriceItemSchema),
  sellingWindow: dashboardSellingWindowSchema,
  olivar: dashboardOlivarSchema,
  finance: dashboardFinanceResumeSchema,
  campaignMargin: dashboardCampaignMarginSchema,
  recommendations: z.object({
    recommendations: z.array(dashboardRecommendationSchema),
  }),
  risks: dashboardRisksSchema,
  mapParcels: z.array(dashboardMapParcelSchema),
  recentEvents: z.array(dashboardCalendarEventSchema),
  productionValue: dashboardProductionValueSchema,
})

/** @deprecated Use slice response types */
export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>
