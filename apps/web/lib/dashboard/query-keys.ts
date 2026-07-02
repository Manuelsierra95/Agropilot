import { getDashboardDailyKey } from "@workspace/web/lib/dashboard/daily-key"
import {
  buildDashboardScopeKey,
  type DashboardScopeParams,
} from "@workspace/web/lib/dashboard/scope-key"

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  overview: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "overview",
      buildDashboardScopeKey(scope),
    ] as const,
  olivePrices: (dailyKey: string = getDashboardDailyKey()) =>
    [...dashboardQueryKeys.all, "olive-prices", dailyKey] as const,
  sellingWindow: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "selling-window",
      buildDashboardScopeKey(scope),
    ] as const,
  financeResume: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "finance-resume",
      buildDashboardScopeKey(scope),
    ] as const,
  campaignMargin: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "campaign-margin",
      buildDashboardScopeKey(scope),
    ] as const,
  recentTransactions: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "recent-transactions",
      buildDashboardScopeKey(scope),
    ] as const,
  financeTransactions: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "finance-transactions",
      buildDashboardScopeKey(scope),
    ] as const,
  productionValue: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "production-value",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelsFinanceComparison: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "parcels-finance-comparison",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelsSellingWindows: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "parcels-selling-windows",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelsCropOverviews: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "parcels-crop-overviews",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelsRecommendations: (dailyKey: string = getDashboardDailyKey()) =>
    [...dashboardQueryKeys.all, "parcels-recommendations", dailyKey] as const,
  parcelsRisks: (dailyKey: string = getDashboardDailyKey()) =>
    [...dashboardQueryKeys.all, "parcels-risks", dailyKey] as const,
  parcelsMap: () => [...dashboardQueryKeys.all, "parcels-map"] as const,
  recommendations: (
    parcelId: string,
    dailyKey: string = getDashboardDailyKey()
  ) =>
    [...dashboardQueryKeys.all, "recommendations", parcelId, dailyKey] as const,
  risks: (parcelId: string, dailyKey: string = getDashboardDailyKey()) =>
    [...dashboardQueryKeys.all, "risks", parcelId, dailyKey] as const,
  cropOverview: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "crop-overview",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelAgroclimate: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "parcel-agroclimate",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelsWeatherComparison: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "parcels-weather-comparison",
      buildDashboardScopeKey(scope),
    ] as const,
  upcomingWeek: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "upcoming-week",
      buildDashboardScopeKey(scope),
    ] as const,
  calendarEvents: (scope: DashboardScopeParams) =>
    [
      ...dashboardQueryKeys.all,
      "calendar-events",
      buildDashboardScopeKey(scope),
    ] as const,
  parcelWeather: (parcelId: string, from: string, to: string) =>
    [...dashboardQueryKeys.all, "parcel-weather", parcelId, from, to] as const,
}

export type DashboardCacheFamily =
  | "finance"
  | "events"
  | "parcels"
  | "production"
  | "daily"
