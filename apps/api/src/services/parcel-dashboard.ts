import { db, schema, eq, and, sql } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  DashboardMapParcel,
  DashboardOlivar,
  DashboardRecommendation,
  DashboardRisks,
  DashboardScopeQuery,
} from "@workspace/schemas"
import {
  resolveActiveCampaign,
  resolveCampaignById,
} from "@/services/campaign"
import {
  getParcelById,
  listParcels,
  resolveParcelIdForOrg,
} from "@/services/parcel"

const TREES_PER_HECTARE = 200

const MAP_PARCEL_COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
] as const

type SeedRiskLevel = "low" | "medium" | "high"

type SeedRisks = {
  frost?: SeedRiskLevel
  drought?: SeedRiskLevel
  pest?: SeedRiskLevel
  waterStress?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  fungalRisk?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  insectRisk?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  thermalStress?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
}

function levelToScore(level: SeedRiskLevel): number {
  switch (level) {
    case "low":
      return 0.25
    case "medium":
      return 0.55
    case "high":
      return 0.85
  }
}

function buildRiskDetail(
  level: SeedRiskLevel,
  reasons: string[]
): DashboardRisks["waterStress"] {
  return {
    level,
    score: levelToScore(level),
    reasons,
  }
}

function mapDbRisksToDashboard(risks: unknown): DashboardRisks {
  const raw = (risks ?? {}) as SeedRisks

  if (raw.waterStress?.level) {
    return {
      waterStress: {
        level: raw.waterStress.level,
        score: raw.waterStress.score ?? levelToScore(raw.waterStress.level),
        reasons: raw.waterStress.reasons ?? [],
      },
      fungalRisk: {
        level: raw.fungalRisk?.level ?? "low",
        score:
          raw.fungalRisk?.score ??
          levelToScore(raw.fungalRisk?.level ?? "low"),
        reasons: raw.fungalRisk?.reasons ?? [],
      },
      insectRisk: {
        level: raw.insectRisk?.level ?? "low",
        score:
          raw.insectRisk?.score ?? levelToScore(raw.insectRisk?.level ?? "low"),
        reasons: raw.insectRisk?.reasons ?? [],
      },
      thermalStress: {
        level: raw.thermalStress?.level ?? "low",
        score:
          raw.thermalStress?.score ??
          levelToScore(raw.thermalStress?.level ?? "low"),
        reasons: raw.thermalStress?.reasons ?? [],
      },
    }
  }

  const drought = raw.drought ?? "low"
  const frost = raw.frost ?? "low"
  const pest = raw.pest ?? "low"

  return {
    waterStress: buildRiskDetail(drought, [
      drought === "high"
        ? "Déficit hídrico prolongado"
        : "Balance hídrico dentro de rangos",
    ]),
    fungalRisk: buildRiskDetail(
      drought === "high" ? "medium" : "low",
      ["Humedad y temperatura favorables a hongos"]
    ),
    insectRisk: buildRiskDetail(pest, [
      pest === "high" ? "Presión de plagas elevada" : "Presión de plagas baja",
    ]),
    thermalStress: buildRiskDetail(frost, [
      frost === "high"
        ? "Riesgo de heladas o estrés térmico"
        : "Temperaturas estables",
    ]),
  }
}

function mapDbRecommendationsToDashboard(
  recommendations: unknown
): DashboardRecommendation[] {
  if (!recommendations) return []

  if (Array.isArray(recommendations)) {
    return recommendations.map((item, index) => {
      if (typeof item === "string") {
        return {
          type: "general",
          priority: index === 0 ? "high" : "medium",
          message: item,
          details: item,
        }
      }

      const rec = item as {
        type?: string
        priority?: "low" | "medium" | "high"
        message?: string
        details?: string
      }

      return {
        type: rec.type ?? "general",
        priority: rec.priority ?? "medium",
        message: rec.message ?? "",
        details: rec.details ?? rec.message ?? "",
      }
    })
  }

  return []
}

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

function parseWktPoint(
  wkt: string | null | undefined
): { lat: number; lng: number } | null {
  if (!wkt) return null

  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (!match?.[1] || !match[2]) return null

  return {
    lng: Number(match[1]),
    lat: Number(match[2]),
  }
}

function mapParcelsToMapFeatures(
  parcels: {
    id: string
    name: string
    cropType: string
    areaHa: string | null
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
        area: parcel.areaHa ? Number(parcel.areaHa) : 0,
        type: parcel.cropType,
        color: MAP_PARCEL_COLORS[index % MAP_PARCEL_COLORS.length]!,
        geometryType: "Polygon" as const,
        geometryCoordinates,
      },
    ]
  })
}

function emptyOlivarOverview(
  parcel: { name: string; cropType: string; areaHa: string | null },
  coordinates: { lat: number; lng: number }
): DashboardOlivar {
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

async function loadParcelWeather(parcelId: string) {
  return db.query.parcelWeather.findFirst({
    where: eq(schema.parcelWeather.parcelId, parcelId),
  })
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
  const weather = await loadParcelWeather(parcelId)
  return mapDbRecommendationsToDashboard(weather?.recommendations)
}

export async function getParcelRisks(
  organizationId: string,
  parcelId: string
): Promise<DashboardRisks> {
  await getParcelById(organizationId, parcelId)
  const weather = await loadParcelWeather(parcelId)
  return mapDbRisksToDashboard(weather?.risks)
}

export async function getParcelCropOverview(
  organizationId: string,
  parcelId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardOlivar> {
  const parcel = await getParcelById(organizationId, parcelId)
  const coords = parseWktPoint(parcel.centroid ?? null) ?? {
    lat: 38,
    lng: -3.37,
  }

  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : filters.from && filters.to
      ? null
      : await resolveActiveCampaign()

  const campaignId = campaign?.id

  const [weather, station, financialSummaries, taskCounts] = await Promise.all([
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
      .groupBy(schema.tasks.status),
  ])

  const primarySummary = financialSummaries[0]
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
  const recommendationsList = mapDbRecommendationsToDashboard(
    weather?.recommendations
  )

  const pendingTasks =
    taskCounts.find((row) => row.status === "pending")?.count ?? 0
  const completedTasks =
    taskCounts.find((row) => row.status === "done")?.count ?? 0

  return {
    ...emptyOlivarOverview(parcel, coords),
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
    aiInsight: recommendationsList[0]?.message ?? "",
  }
}

export async function resolvePrimaryParcelId(
  organizationId: string,
  parcelId?: string
): Promise<string> {
  const resolved = await resolveParcelIdForOrg(organizationId, parcelId)
  if (!resolved) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }
  return resolved
}
