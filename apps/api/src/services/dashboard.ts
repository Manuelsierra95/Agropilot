import {
  db,
  schema,
  eq,
  and,
  asc,
  desc,
  gte,
  lte,
  sql,
} from "@workspace/db"
import type { DashboardOverview, OilGrade } from "@workspace/schemas"
import { DASHBOARD_OIL_GRADES } from "@workspace/schemas"
import {
  getCampaignPeriodForDate,
  listTransactions,
  queryMarketPrices,
  type MarketPriceRow,
} from "@/services/finance"
import { listParcels, resolveParcelIdForOrg } from "@/services/parcel"
import {
  buildCampaignMarginSeries,
  buildMonthlyProductionKg,
  buildOlivePriceItems,
  getCampaignStartYear,
  mapDbRecommendationsToDashboard,
  mapDbRisksToDashboard,
  mapParcelsToMapFeatures,
  mapTaskToCalendarEvent,
  mapTransactionToSnapshot,
  parseWktPoint,
} from "@/services/dashboard/mappers"

const TREES_PER_HECTARE = 200
const MARKET_HISTORY_DAYS = 90
const RECENT_TRANSACTION_LIMIT = 50
const UPCOMING_TASK_DAYS = 14

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getPreviousCampaignName(name: string): string {
  const [startYear] = name.split("/").map(Number)
  if (!Number.isFinite(startYear)) return name
  return `${startYear - 1}/${startYear}`
}

async function resolveActiveCampaign() {
  const active = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.isActive, true),
    orderBy: [desc(schema.campaigns.startDate)],
  })

  if (active) return active

  const period = getCampaignPeriodForDate(todayIso())
  return db.query.campaigns.findFirst({
    where: eq(schema.campaigns.name, period.name),
  })
}

async function fetchMarketPricesByGrade(
  from: string,
  to: string
): Promise<Record<OilGrade, MarketPriceRow[]>> {
  const entries = await Promise.all(
    DASHBOARD_OIL_GRADES.map(async (grade) => {
      const rows = await queryMarketPrices({ grade, from, to })
      return [grade, rows] as const
    })
  )

  return Object.fromEntries(entries) as Record<OilGrade, MarketPriceRow[]>
}

function emptyOlivarOverview(
  parcel: { name: string; cropType: string; areaHa: string | null },
  coordinates: { lat: number; lng: number }
): DashboardOverview["olivar"] {
  return {
    name: parcel.name,
    coordinates,
    stationId: "—",
    cropType: parcel.cropType,
    area: parcel.areaHa ? Number(parcel.areaHa) : 0,
    lastUpdate: new Date().toISOString(),
    temperature: 0,
    temperatureChange: 0,
    phenologicalStage: "—",
    gdd: 0,
    gddTarget: 3000,
    kc: 0.5,
    waterBalance: 0,
    estimatedProfitability: 0,
    participants: 1,
    pendingTasks: 0,
    completedTasks: 0,
    totalTrees: parcel.areaHa
      ? Math.round(Number(parcel.areaHa) * TREES_PER_HECTARE)
      : 0,
    totalYieldKg: 0,
    aiInsight: "",
  }
}

export async function getDashboardOverview(
  organizationId: string
): Promise<DashboardOverview> {
  const today = todayIso()
  const marketFrom = daysAgoIso(MARKET_HISTORY_DAYS)
  const taskTo = addDaysIso(today, UPCOMING_TASK_DAYS)

  const [
    campaign,
    parcels,
    transactions,
    pricesByGrade,
    parcelId,
  ] = await Promise.all([
    resolveActiveCampaign(),
    listParcels(organizationId),
    listTransactions(organizationId),
    fetchMarketPricesByGrade(marketFrom, today),
    resolveParcelIdForOrg(organizationId),
  ])

  const primaryParcel =
    parcels.find((p) => p.id === parcelId) ?? parcels[0] ?? null

  const campaignId = campaign?.id
  const previousCampaignName = campaign
    ? getPreviousCampaignName(campaign.name)
    : null

  const [
    financialSummaries,
    previousSummaries,
    cashflowDaily,
    previousCashflowDaily,
    weather,
    station,
    upcomingTasks,
  ] = await Promise.all([
    campaignId
      ? db.query.parcelFinancialSummaries.findMany({
          where: primaryParcel
            ? and(
                eq(schema.parcelFinancialSummaries.campaignId, campaignId),
                eq(
                  schema.parcelFinancialSummaries.parcelId,
                  primaryParcel.id
                )
              )
            : eq(schema.parcelFinancialSummaries.campaignId, campaignId),
        })
      : Promise.resolve([]),
    previousCampaignName
      ? db.query.campaigns
          .findFirst({
            where: eq(schema.campaigns.name, previousCampaignName),
          })
          .then((prev) =>
            prev
              ? db.query.parcelFinancialSummaries.findMany({
                  where: eq(
                    schema.parcelFinancialSummaries.campaignId,
                    prev.id
                  ),
                })
              : []
          )
      : Promise.resolve([]),
    campaignId
      ? db.query.parcelCashflowDaily.findMany({
          where: eq(schema.parcelCashflowDaily.campaignId, campaignId),
          orderBy: [asc(schema.parcelCashflowDaily.date)],
        })
      : Promise.resolve([]),
    previousCampaignName
      ? db.query.campaigns
          .findFirst({
            where: eq(schema.campaigns.name, previousCampaignName),
          })
          .then((prev) =>
            prev
              ? db.query.parcelCashflowDaily.findMany({
                  where: eq(
                    schema.parcelCashflowDaily.campaignId,
                    prev.id
                  ),
                  orderBy: [asc(schema.parcelCashflowDaily.date)],
                })
              : []
          )
      : Promise.resolve([]),
    primaryParcel
      ? db.query.parcelWeather.findFirst({
          where: eq(schema.parcelWeather.parcelId, primaryParcel.id),
        })
      : Promise.resolve(null),
    primaryParcel
      ? db.query.parcelStation.findFirst({
          where: eq(schema.parcelStation.parcelId, primaryParcel.id),
        })
      : Promise.resolve(null),
    db.query.tasks.findMany({
      where: and(
        eq(schema.tasks.organizationId, organizationId),
        gte(schema.tasks.startDate, new Date(`${today}T00:00:00.000Z`)),
        lte(schema.tasks.startDate, new Date(`${taskTo}T23:59:59.999Z`))
      ),
      orderBy: [asc(schema.tasks.startDate)],
      limit: 20,
    }),
  ])

  const olivePrices = buildOlivePriceItems(pricesByGrade)
  const virgenExtraPrice =
    olivePrices.find((item) => item.name === "Virgen Extra")?.price ?? 0

  const primarySummary = financialSummaries[0]
  const totalExpectedKg = financialSummaries.reduce(
    (sum, row) => sum + Number(row.expectedYieldKg ?? row.totalKg ?? 0),
    0
  )

  const sellingWindow: DashboardOverview["sellingWindow"] = {
    lonjaPrice: virgenExtraPrice,
    costPerKg: primarySummary?.costPerKg
      ? Number(primarySummary.costPerKg)
      : 0,
    lastSalePrice: primarySummary?.revenuePerKg
      ? Number(primarySummary.revenuePerKg)
      : undefined,
    estimatedKg: totalExpectedKg || Number(primarySummary?.expectedYieldKg ?? 0),
    campaignTarget: primarySummary?.avgMarketPrice
      ? Number(primarySummary.avgMarketPrice)
      : virgenExtraPrice,
  }

  const coords =
    parseWktPoint(primaryParcel?.centroid ?? null) ?? { lat: 38, lng: -3.37 }

  const metrics = (weather?.metrics ?? {}) as Record<string, unknown>
  const cropMetrics = (metrics.crop ?? {}) as Record<string, number | string>
  const tempMetrics = (metrics.temperature ?? {}) as Record<
    number | string,
    number
  >
  const dailyData = (weather?.data ?? {}) as {
    daily?: { temperature?: number }[]
  }
  const latestDailyTemp = dailyData.daily?.at(-1)?.temperature

  const taskCounts = await db
    .select({
      status: schema.tasks.status,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.tasks)
    .where(eq(schema.tasks.organizationId, organizationId))
    .groupBy(schema.tasks.status)

  const pendingTasks =
    taskCounts.find((row) => row.status === "pending")?.count ?? 0
  const completedTasks =
    taskCounts.find((row) => row.status === "done")?.count ?? 0

  const recommendationsList = mapDbRecommendationsToDashboard(
    weather?.recommendations
  )
  const aiInsight = recommendationsList[0]?.message ?? ""

  const olivar: DashboardOverview["olivar"] = primaryParcel
    ? {
        ...emptyOlivarOverview(primaryParcel, coords),
        stationId: station?.primaryStationId ?? "—",
        lastUpdate: weather?.computedAt?.toISOString() ?? new Date().toISOString(),
        temperature:
          latestDailyTemp ??
          Number(tempMetrics.avg7d ?? tempMetrics.avg30d ?? 0),
        temperatureChange: Number(tempMetrics.trend ?? 0),
        phenologicalStage: String(cropMetrics.stage ?? "Vegetativo"),
        gdd: Number(cropMetrics.gdd ?? 0),
        gddTarget: 3000,
        kc: Number(cropMetrics.kc ?? 0.5),
        waterBalance: Number(
          (metrics.water as { deficit7d?: number })?.deficit7d ?? 0
        ),
        estimatedProfitability: primarySummary?.profit
          ? Number(primarySummary.profit)
          : 0,
        pendingTasks,
        completedTasks,
        totalYieldKg: primarySummary?.totalKg
          ? Number(primarySummary.totalKg)
          : 0,
        aiInsight,
      }
    : emptyOlivarOverview(
        { name: "Sin parcelas", cropType: "olivo", areaHa: null },
        coords
      )

  const previousIncome = previousSummaries.reduce(
    (sum, row) => sum + Number(row.totalIncome ?? 0),
    0
  )
  const previousExpenses = previousSummaries.reduce(
    (sum, row) => sum + Number(row.totalExpense ?? 0),
    0
  )

  const finance: DashboardOverview["finance"] = {
    transactions: transactions
      .slice(0, RECENT_TRANSACTION_LIMIT)
      .map(mapTransactionToSnapshot),
    previousCampaign:
      previousIncome > 0 || previousExpenses > 0
        ? { totalIncome: previousIncome, totalExpenses: previousExpenses }
        : undefined,
  }

  const aggregatedCashflow = aggregateCashflowByDate(cashflowDaily)
  const campaignStart = campaign?.startDate ?? getCampaignPeriodForDate(today).startDate

  const campaignMargin = buildCampaignMarginSeries(
    campaignStart,
    aggregatedCashflow
  )

  const parcelNameById = new Map(parcels.map((p) => [p.id, p.name]))
  const recentEvents = upcomingTasks.map((task) =>
    mapTaskToCalendarEvent(
      task,
      task.parcelId ? (parcelNameById.get(task.parcelId) ?? "—") : "—"
    )
  )

  const totalAreaHa = parcels.reduce(
    (sum, p) => sum + (p.areaHa ? Number(p.areaHa) : 0),
    0
  )

  const productionValue: DashboardOverview["productionValue"] = {
    monthlyProductionKg: buildMonthlyProductionKg(
      aggregatedCashflow,
      virgenExtraPrice || 1
    ),
    prevMonthlyProductionKg: buildMonthlyProductionKg(
      aggregateCashflowByDate(previousCashflowDaily),
      virgenExtraPrice || 1
    ),
    lonjaPrice: virgenExtraPrice,
    numOlivos: Math.round(totalAreaHa * TREES_PER_HECTARE),
    campaignStartYear: getCampaignStartYear(campaignStart),
  }

  return {
    olivePrices,
    sellingWindow,
    olivar,
    finance,
    campaignMargin,
    recommendations: { recommendations: recommendationsList },
    risks: mapDbRisksToDashboard(weather?.risks),
    mapParcels: mapParcelsToMapFeatures(parcels),
    recentEvents,
    productionValue,
  }
}

function aggregateCashflowByDate(
  rows: { date: string; income: string | null; expense: string | null }[]
): { date: string; income: string; expense: string }[] {
  const byDate = new Map<string, { income: number; expense: number }>()

  for (const row of rows) {
    const current = byDate.get(row.date) ?? { income: 0, expense: 0 }
    current.income += Number(row.income ?? 0)
    current.expense += Number(row.expense ?? 0)
    byDate.set(row.date, current)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      income: values.income.toFixed(2),
      expense: values.expense.toFixed(2),
    }))
}
