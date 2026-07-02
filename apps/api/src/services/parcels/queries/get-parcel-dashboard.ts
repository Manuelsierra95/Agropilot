import { db, schema, eq, and, sql, inArray } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  DashboardMapParcel,
  DashboardOlivar,
  DashboardParcelsCropOverviews,
  DashboardParcelsRecommendations,
  DashboardParcelsRisks,
  DashboardRecommendation,
  DashboardRisks,
  DashboardScopeQuery,
} from "@workspace/schemas"
import {
  resolveActiveCampaign,
  resolveCampaignById,
} from "@workspace/api/services/campaigns"
import { getParcelById, listParcels } from "@workspace/api/services/parcels/queries/list-parcels"
import {
  mapDbRisksToDashboard,
} from "@workspace/api/services/parcels/mappers/parcel-dashboard.mapper"
import { parseWktPoint } from "@workspace/api/services/shared/geometry-utils"

const TREES_PER_HECTARE = 200

const MAP_PARCEL_COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
] as const

function parseWktPolygon(wkt: string | null | undefined): number[][][] | null {
  if (!wkt) return null

  const match = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/i)
  if (!match?.[1]) return null

  const ring = match[1].split(",").map((pair) => {
    const parts = pair.trim().split(/\s+/).map(Number)
    const lng = parts[0] ?? 0
    const lat = parts[1] ?? 0
    return [lng, lat]
  })

  return ring.length > 0 ? [ring] : null
}

function mapParcelsToMapFeatures(
  parcels: {
    id: string
    name: string
    cropType: string
    areaM2: number | null
    polygon: string | null
  }[]
): DashboardMapParcel[] {
  return parcels.flatMap((parcel, index) => {
    const geometryCoordinates = parseWktPolygon(parcel.polygon)
    if (!geometryCoordinates) return []

    return [
      {
        id: parcel.id,
        name: parcel.name,
        area: parcel.areaM2 ? parcel.areaM2 / 10000 : 0,
        type: parcel.cropType,
        color: MAP_PARCEL_COLORS[index % MAP_PARCEL_COLORS.length]!,
        geometryType: "Polygon" as const,
        geometryCoordinates,
      },
    ]
  })
}

function emptyOlivarOverview(
  parcel: { name: string; cropType: string; areaM2: number | null },
  coordinates: { lat: number; lng: number }
): DashboardOlivar {
  const areaHa = parcel.areaM2 ? parcel.areaM2 / 10000 : 0

  return {
    name: parcel.name,
    coordinates,
    stationId: "—",
    cropType: parcel.cropType,
    area: areaHa,
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
    totalTrees: Math.round(areaHa * TREES_PER_HECTARE),
    totalYieldKg: 0,
    aiInsight: "",
  }
}

async function loadParcelWeather(parcelId: string) {
  return db.query.parcelWeather.findFirst({
    where: eq(schema.parcelWeather.parcelId, parcelId),
  })
}

async function loadParcelWeatherBatch(parcelIds: string[]) {
  if (parcelIds.length === 0) return []

  return db.query.parcelWeather.findMany({
    where: inArray(schema.parcelWeather.parcelId, parcelIds),
  })
}

type ParcelRow = Awaited<ReturnType<typeof listParcels>>[number]

type TaskCountRow = {
  parcelId: string | null
  status: string
  count: number
}

function groupTaskCountsByParcel(rows: TaskCountRow[]) {
  const byParcel = new Map<string, { pending: number; done: number }>()

  for (const row of rows) {
    if (!row.parcelId) continue
    const current = byParcel.get(row.parcelId) ?? { pending: 0, done: 0 }
    if (row.status === "pending") current.pending = row.count
    if (row.status === "done") current.done = row.count
    byParcel.set(row.parcelId, current)
  }

  return byParcel
}

function buildCropOverview(
  parcel: ParcelRow,
  weather: Awaited<ReturnType<typeof loadParcelWeather>>,
  station: { primaryStationId: string | null } | null | undefined,
  primarySummary:
    | {
        profit: string | null
        totalKg: string | null
      }
    | undefined,
  taskCounts: { pending: number; done: number },
  aiInsight = ""
): DashboardOlivar {
  const coords = parseWktPoint(parcel.centroid ?? null) ?? {
    lat: 38,
    lng: -3.37,
  }

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

  return {
    ...emptyOlivarOverview(parcel, coords),
    stationId: station?.primaryStationId ?? "—",
    lastUpdate: weather?.computedAt?.toISOString() ?? new Date().toISOString(),
    temperature:
      latestDailyTemp ?? Number(tempMetrics.avg7d ?? tempMetrics.avg30d ?? 0),
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
    pendingTasks: taskCounts.pending,
    completedTasks: taskCounts.done,
    totalYieldKg: primarySummary?.totalKg ? Number(primarySummary.totalKg) : 0,
    aiInsight,
  }
}

async function resolveCampaignIdForFilters(
  filters: DashboardScopeQuery
): Promise<string | undefined> {
  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : filters.from && filters.to
      ? null
      : await resolveActiveCampaign()

  return campaign?.id
}

export async function getParcelsForMap(
  organizationId: string
): Promise<DashboardMapParcel[]> {
  const parcels = await listParcels(organizationId)
  return mapParcelsToMapFeatures(parcels)
}

export async function getParcelRecommendations(
  organizationId: string,
  parcelId: string
): Promise<DashboardRecommendation[]> {
  await getParcelById(organizationId, parcelId)
  const { listRecommendationsAsDashboard } = await import(
    "@workspace/api/services/recommendations"
  )
  return listRecommendationsAsDashboard(organizationId, {
    parcelId,
    status: "pending",
  })
}

export async function getParcelCropOverview(
  organizationId: string,
  parcelId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardOlivar> {
  const parcel = await getParcelById(organizationId, parcelId)
  const campaignId = await resolveCampaignIdForFilters(filters)

  const [weather, station, financialSummaries, taskCountRows, recommendations] =
    await Promise.all([
      loadParcelWeather(parcelId),
      db.query.parcelStation.findFirst({
        where: eq(schema.parcelStation.parcelId, parcelId),
      }),
      campaignId
        ? db.query.parcelFinancialSummaries.findMany({
            where: and(
              eq(schema.parcelFinancialSummaries.campaignId, campaignId),
              eq(schema.parcelFinancialSummaries.parcelId, parcelId)
            ),
          })
        : Promise.resolve([]),
      db
        .select({
          parcelId: schema.tasks.parcelId,
          status: schema.tasks.status,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.tasks)
        .where(
          and(
            eq(schema.tasks.organizationId, organizationId),
            eq(schema.tasks.parcelId, parcelId)
          )
        )
        .groupBy(schema.tasks.parcelId, schema.tasks.status),
      getParcelRecommendations(organizationId, parcelId),
    ])

  const taskCounts = groupTaskCountsByParcel(taskCountRows).get(parcelId) ?? {
    pending: 0,
    done: 0,
  }

  return buildCropOverview(
    parcel,
    weather,
    station,
    financialSummaries[0],
    taskCounts,
    recommendations[0]?.message ?? ""
  )
}

export async function getParcelsCropOverviewsForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardParcelsCropOverviews> {
  const [parcels, campaignId] = await Promise.all([
    listParcels(organizationId),
    resolveCampaignIdForFilters(filters),
  ])

  const parcelIds = parcels.map((parcel) => parcel.id)
  const { listActiveRecommendations } = await import(
    "@workspace/api/services/recommendations"
  )

  const [weatherRows, stationRows, financialSummaries, taskCountRows, activeRecs] =
    await Promise.all([
      loadParcelWeatherBatch(parcelIds),
      parcelIds.length > 0
        ? db.query.parcelStation.findMany({
            where: inArray(schema.parcelStation.parcelId, parcelIds),
          })
        : Promise.resolve([]),
      campaignId
        ? db.query.parcelFinancialSummaries.findMany({
            where: eq(schema.parcelFinancialSummaries.campaignId, campaignId),
          })
        : Promise.resolve([]),
      db
        .select({
          parcelId: schema.tasks.parcelId,
          status: schema.tasks.status,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.tasks)
        .where(eq(schema.tasks.organizationId, organizationId))
        .groupBy(schema.tasks.parcelId, schema.tasks.status),
      listActiveRecommendations(organizationId, { status: "pending" }),
    ])

  const weatherByParcelId = new Map(
    weatherRows.map((row) => [row.parcelId, row])
  )
  const stationByParcelId = new Map(
    stationRows.map((row) => [row.parcelId, row])
  )
  const summaryByParcelId = new Map(
    financialSummaries.map((row) => [row.parcelId, row])
  )
  const taskCountsByParcelId = groupTaskCountsByParcel(taskCountRows)
  const insightByParcelId = new Map<string, string>()
  for (const rec of activeRecs) {
    if (rec.parcelId && !insightByParcelId.has(rec.parcelId)) {
      insightByParcelId.set(rec.parcelId, rec.title)
    }
  }

  return {
    parcels: parcels.map((parcel) => ({
      parcelId: parcel.id,
      ...buildCropOverview(
        parcel,
        weatherByParcelId.get(parcel.id),
        stationByParcelId.get(parcel.id),
        summaryByParcelId.get(parcel.id),
        taskCountsByParcelId.get(parcel.id) ?? { pending: 0, done: 0 },
        insightByParcelId.get(parcel.id) ?? ""
      ),
    })),
  }
}

export async function getParcelsRecommendationsForDashboard(
  organizationId: string
): Promise<DashboardParcelsRecommendations> {
  const { listAllParcelsRecommendationsAsDashboard } = await import(
    "@workspace/api/services/recommendations"
  )
  const parcels = await listAllParcelsRecommendationsAsDashboard(organizationId)

  return {
    parcels: parcels.map((parcel) => ({
      parcelId: parcel.parcelId,
      name: parcel.parcelName,
      recommendations: parcel.recommendations,
    })),
  }
}

export async function getParcelsRisksForDashboard(
  organizationId: string
): Promise<DashboardParcelsRisks> {
  const parcels = await listParcels(organizationId)
  const parcelIds = parcels.map((parcel) => parcel.id)
  const weatherRows = await loadParcelWeatherBatch(parcelIds)
  const weatherByParcelId = new Map(
    weatherRows.map((row) => [row.parcelId, row])
  )

  return {
    parcels: parcels.map((parcel) => ({
      parcelId: parcel.id,
      name: parcel.name,
      risks: mapDbRisksToDashboard(weatherByParcelId.get(parcel.id)?.risks),
    })),
  }
}

export async function resolvePrimaryParcelId(
  organizationId: string,
  parcelId?: string
): Promise<string> {
  if (!parcelId) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { id: true },
  })

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  return parcel.id
}
