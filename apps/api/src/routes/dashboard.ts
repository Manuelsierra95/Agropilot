import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@workspace/api/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@workspace/api/middlewares/require-auth"
import { createCacheMiddleware } from "@workspace/api/middlewares/cache"
import { apiQuerySchema } from "@workspace/schemas"
import { apiResponse } from "@workspace/api/lib/api-response"
import {
  getCampaignMarginForDashboard,
  getFinanceResumeForDashboard,
  getOlivePricesForDashboard,
  getParcelsFinanceComparisonForDashboard,
  getParcelsSellingWindowsForDashboard,
  getProductionValueForDashboard,
  getRecentTransactionsForDashboard,
  getSellingWindowForDashboard,
} from "@workspace/api/services/finance"
import {
  getParcelCropOverview,
  getParcelRecommendations,
  getParcelWeather,
  getParcelsCropOverviewsForDashboard,
  getParcelsForMap,
  getParcelsRecommendationsForDashboard,
  getParcelsRisksForDashboard,
} from "@workspace/api/services/parcels"
import { listUpcomingWeekTasks } from "@workspace/api/services/tasks"

const cache5min = createCacheMiddleware({ ttlSeconds: 300 })

const RECOMMENDATION_PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const

export const dashboardRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)

  .get("/overview", cache5min, zValidator("query", apiQuerySchema), async (c) => {
    const query = c.req.valid("query")
    const organizationId = c.get("organizationId")
    const parcelId = query.parcelId

    const meta = {
      scope: (parcelId ? "parcel" : "organization") as "parcel" | "organization",
      mode: query.mode,
      from: query.from,
      to: query.to,
      ...(parcelId ? { parcelId } : {}),
    }

    if (parcelId) {
      const [
        olivePrices,
        sellingWindow,
        overview,
        productionValue,
        resume,
        campaignMargin,
        recentTransactions,
        recommendations,
        weather,
        upcomingWeek,
        parcelsMap,
      ] = await Promise.all([
        getOlivePricesForDashboard(),
        getSellingWindowForDashboard(organizationId, query),
        getParcelCropOverview(organizationId, parcelId, query),
        getProductionValueForDashboard(organizationId, query),
        getFinanceResumeForDashboard(organizationId, query),
        getCampaignMarginForDashboard(organizationId, query),
        getRecentTransactionsForDashboard(organizationId, {
          ...query,
          limit: query.limit ?? 50,
        }),
        getParcelRecommendations(organizationId, parcelId),
        getParcelWeather(organizationId, parcelId),
        listUpcomingWeekTasks(organizationId, {
          parcelId,
          weekStart: query.from,
        }),
        getParcelsForMap(organizationId),
      ])

      return c.json(
        apiResponse({
          data: {
            market: { olivePrices, sellingWindow },
            crop: { overview, productionValue },
            finance: { resume, campaignMargin, recentTransactions },
            intelligence: {
              recommendations,
              risks: weather.data.risks,
            },
            operations: { upcomingWeek, parcelsMap },
          },
          meta,
        }),
        200
      )
    }

    const [
      olivePrices,
      allSellingWindows,
      allOverviews,
      productionValue,
      comparison,
      recentTransactions,
      allRecommendationsRaw,
      allRisksRaw,
      upcomingWeek,
      parcelsMap,
    ] = await Promise.all([
      getOlivePricesForDashboard(),
      getParcelsSellingWindowsForDashboard(organizationId, query),
      getParcelsCropOverviewsForDashboard(organizationId, query),
      getProductionValueForDashboard(organizationId, query),
      getParcelsFinanceComparisonForDashboard(organizationId, query),
      getRecentTransactionsForDashboard(organizationId, {
        ...query,
        limit: query.limit ?? 50,
      }),
      getParcelsRecommendationsForDashboard(organizationId),
      getParcelsRisksForDashboard(organizationId),
      listUpcomingWeekTasks(organizationId, { weekStart: query.from }),
      getParcelsForMap(organizationId),
    ])

    const allRecommendations = allRecommendationsRaw.parcels.flatMap(
      (parcel) =>
        parcel.recommendations.map((rec) => ({
          parcelId: parcel.parcelId,
          parcelName: parcel.name,
          ...rec,
        }))
    )
    allRecommendations.sort(
      (a, b) =>
        RECOMMENDATION_PRIORITY_ORDER[a.priority] -
        RECOMMENDATION_PRIORITY_ORDER[b.priority]
    )

    const allRisks = allRisksRaw.parcels.map((parcel) => ({
      parcelId: parcel.parcelId,
      name: parcel.name,
      risks: parcel.risks,
    }))

    return c.json(
      apiResponse({
        data: {
          market: { olivePrices, allSellingWindows: allSellingWindows.parcels },
          crop: {
            allOverviews: allOverviews.parcels,
            productionValue,
          },
          finance: { comparison, recentTransactions },
          intelligence: { allRecommendations, allRisks },
          operations: { upcomingWeek, parcelsMap },
        },
        meta,
      }),
      200
    )
  })
