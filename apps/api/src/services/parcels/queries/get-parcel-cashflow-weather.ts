import { db, schema, eq, and, gte, lte } from "@workspace/db"
import { z } from "zod"
import {
  parcelWeatherDataSchema,
  type ParcelWeatherMetric,
} from "@workspace/schemas"
import type { RiskRecommendation } from "@workspace/api/services/weather/domain/weathercloud"

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
    orderBy: [],
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
