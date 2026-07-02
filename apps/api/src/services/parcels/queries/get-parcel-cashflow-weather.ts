import { db, schema, eq, and, asc, gte, lte } from "@workspace/db"
import { z } from "zod"
import { HTTPException } from "hono/http-exception"
import {
  parcelWeatherDataSchema,
  type ParcelWeatherMetric,
} from "@workspace/schemas"
import type { RiskRecommendation } from "@workspace/api/services/weather/domain/weathercloud"
import { mapDbRisksToDashboard } from "@workspace/api/services/parcels/mappers/parcel-dashboard.mapper"

export type ParcelCashflowQueryFilters = {
  parcelId?: string
  from: string
  to: string
}

export type ParcelCashflowRow = {
  date: string
  income: string | null
  expense: string | null
  parcelId: string
}

export type ParcelWeatherQueryFilters = {
  parcelId?: string
  metric: ParcelWeatherMetric
  from: string
  to: string
}

export type ParcelWeatherDailyRow = {
  date: string
  value: number
  parcelId: string
  parcelName: string
}

type WeatherRiskDetail = {
  level?: string
  score?: number
  reasons?: string[]
}

type WeatherRiskWithRecommendations = WeatherRiskDetail & {
  recommendations: RiskRecommendation[]
}

function weatherMetricValue(
  entry: z.infer<typeof parcelWeatherDataSchema>["daily"][number],
  metric: ParcelWeatherMetric
): number {
  switch (metric) {
    case "soil_moisture":
      return entry.soilMoisture
    case "rainfall":
      return entry.rainfall
    case "temperature":
      return entry.temperature
  }
}

function isRiskObject(value: unknown): value is WeatherRiskDetail {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function nestRecommendationsIntoRisks(
  risks: Record<string, unknown>,
  recommendations: RiskRecommendation[] | null
): Record<string, WeatherRiskWithRecommendations | string | undefined> {
  const recMap = new Map<string, RiskRecommendation[]>()

  if (recommendations) {
    for (const rec of recommendations) {
      const existing = recMap.get(rec.riskType)
      if (existing) {
        existing.push(rec)
      } else {
        recMap.set(rec.riskType, [rec])
      }
    }
  }

  const result: Record<
    string,
    WeatherRiskWithRecommendations | string | undefined
  > = {}

  for (const [key, risk] of Object.entries(risks)) {
    if (!risk) {
      result[key] = undefined
      continue
    }

    if (!isRiskObject(risk)) {
      result[key] = risk as string
      continue
    }

    result[key] = {
      ...risk,
      recommendations: recMap.get(key) ?? [],
    }
  }

  return result
}

export async function queryParcelCashflow(
  organizationId: string,
  filters: ParcelCashflowQueryFilters
): Promise<ParcelCashflowRow[]> {
  if (!filters.parcelId) {
    return []
  }

  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, filters.parcelId)
    ),
    columns: { id: true },
  })

  if (!parcel) {
    return []
  }

  return db.query.parcelCashflowDaily.findMany({
    where: and(
      eq(schema.parcelCashflowDaily.parcelId, filters.parcelId),
      gte(schema.parcelCashflowDaily.date, filters.from),
      lte(schema.parcelCashflowDaily.date, filters.to)
    ),
    orderBy: [asc(schema.parcelCashflowDaily.date)],
    columns: {
      date: true,
      income: true,
      expense: true,
      parcelId: true,
    },
  })
}

export async function queryParcelWeather(
  organizationId: string,
  filters: ParcelWeatherQueryFilters
): Promise<ParcelWeatherDailyRow[]> {
  if (!filters.parcelId) {
    return []
  }

  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, filters.parcelId)
    ),
    columns: { id: true, name: true },
  })

  if (!parcel) {
    return []
  }

  const parcelId = parcel.id

  const weather = await db.query.parcelWeather.findFirst({
    where: eq(schema.parcelWeather.parcelId, parcelId),
    columns: { status: true, data: true },
  })

  if (!weather || weather.status !== "ok") {
    return []
  }

  const parsed = parcelWeatherDataSchema.safeParse(weather.data)
  if (!parsed.success) {
    return []
  }

  return parsed.data.daily
    .filter((entry) => entry.date >= filters.from && entry.date <= filters.to)
    .map((entry) => ({
      date: entry.date,
      value: weatherMetricValue(entry, filters.metric),
      parcelId: parcel.id,
      parcelName: parcel.name,
    }))
}

export async function getParcelWeather(
  organizationId: string,
  parcelId: string
) {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { id: true },
  })

  if (!parcel) throw new HTTPException(404, { message: "Parcel not found" })

  const weather = await db.query.parcelWeather.findFirst({
    where: eq(schema.parcelWeather.parcelId, parcelId),
  })

  if (!weather) throw new HTTPException(404, { message: "Weather not found" })

  const { listActiveRecommendations } = await import(
    "@workspace/api/services/recommendations"
  )
  const tableRecommendations = await listActiveRecommendations(
    organizationId,
    { parcelId, status: "pending" }
  )

  const riskRecommendations: RiskRecommendation[] = []

  for (const rec of tableRecommendations) {
    const meta = rec.meta as {
      riskType?: RiskRecommendation["riskType"]
      window?: string
      actions?: RiskRecommendation["actions"]
    } | null

    if (!meta?.riskType) continue

    const urgency =
      rec.priority === "high"
        ? "high"
        : rec.priority === "medium"
          ? "medium"
          : "low"

    riskRecommendations.push({
      riskType: meta.riskType,
      title: rec.title,
      description: rec.details,
      urgency,
      window: meta.window,
      actions: meta.actions ?? [],
    })
  }

  const risksWithRecommendations = nestRecommendationsIntoRisks(
    weather.risks as Record<string, unknown>,
    riskRecommendations
  )

  return {
    data: {
      ...weather,
      risks: mapDbRisksToDashboard(risksWithRecommendations),
    },
  }
}
