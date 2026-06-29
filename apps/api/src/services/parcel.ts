import { db, schema, eq, and, asc, gte, lte, sql } from "@workspace/db"
import { z } from "zod"
import { HTTPException } from "hono/http-exception"
import {
  ParcelCreateOutput,
  ParcelUpdateOutput,
  parcelWeatherDataSchema,
  type ParcelCreateInput,
  type ParcelSelect,
  type ParcelUpdateInput,
  type ParcelWeatherMetric,
} from "@workspace/schemas"
import { getStations } from "@/services/weather"
import { geoService } from "./geometry-utils"
import type { RiskRecommendation } from "@/services/weathercloud"

type ParcelLocationValues = {
  refcat: string | null
  province: string | null
  municipality: string | null
  streetType: string | null
  streetName: string | null
  streetNumber: string | null
  postalCode: string | null
}

function resolveParcelAreaM2(areaM2?: number | string | null): number | null {
  if (areaM2 == null) return null
  return Math.round(Number(areaM2))
}

function extractLocationFields(data: {
  refcat?: string | null
  province?: string | null
  municipality?: string | null
  streetType?: string | null
  streetName?: string | null
  streetNumber?: string | null
  postalCode?: string | null
}): { location: ParcelLocationValues; hasLocation: boolean } {
  const location: ParcelLocationValues = {
    refcat: data.refcat ?? null,
    province: data.province ?? null,
    municipality: data.municipality ?? null,
    streetType: data.streetType ?? null,
    streetName: data.streetName ?? null,
    streetNumber: data.streetNumber ?? null,
    postalCode: data.postalCode ?? null,
  }

  const hasLocation = Object.values(location).some((value) => value != null)

  return { location, hasLocation }
}

function splitLocationInput<
  T extends {
    refcat?: string | null
    province?: string | null
    municipality?: string | null
    streetType?: string | null
    streetName?: string | null
    streetNumber?: string | null
    postalCode?: string | null
  },
>(data: T) {
  const {
    refcat,
    province,
    municipality,
    streetType,
    streetName,
    streetNumber,
    postalCode,
    ...parcelData
  } = data

  return {
    parcelData,
    ...extractLocationFields({
      refcat,
      province,
      municipality,
      streetType,
      streetName,
      streetNumber,
      postalCode,
    }),
  }
}

async function upsertParcelLocation(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  parcelId: string,
  location: ParcelLocationValues
) {
  const existing = await tx.query.parcelLocation.findFirst({
    where: eq(schema.parcelLocation.parcelId, parcelId),
  })

  if (existing) {
    await tx
      .update(schema.parcelLocation)
      .set(location)
      .where(eq(schema.parcelLocation.parcelId, parcelId))
    return
  }

  await tx.insert(schema.parcelLocation).values({
    parcelId,
    ...location,
  })
}

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

export async function getParcelNameForOrg(
  organizationId: string,
  parcelId: string
): Promise<string | null> {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { name: true },
  })

  return parcel?.name ?? null
}

export async function resolveParcelIdForOrg(
  organizationId: string,
  parcelId?: string,
  defaultParcelId?: string
): Promise<string | null> {
  if (parcelId) {
    const parcel = await db.query.parcels.findFirst({
      where: and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, parcelId)
      ),
      columns: { id: true },
    })

    return parcel?.id ?? null
  }

  if (defaultParcelId) {
    const parcel = await db.query.parcels.findFirst({
      where: and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, defaultParcelId)
      ),
      columns: { id: true },
    })

    if (parcel) {
      return parcel.id
    }
  }

  const first = await db.query.parcels.findFirst({
    where: eq(schema.parcels.organizationId, organizationId),
    columns: { id: true },
    orderBy: [asc(schema.parcels.name)],
  })

  return first?.id ?? null
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

export async function listParcels(
  organizationId: string
): Promise<ParcelSelect[]> {
  return db.query.parcels.findMany({
    where: eq(schema.parcels.organizationId, organizationId),
  })
}

export async function getParcelById(
  organizationId: string,
  parcelId: string
): Promise<ParcelSelect> {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
  })

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  return parcel
}

type WeatherRiskDetail = {
  level?: string
  score?: number
  reasons?: string[]
}

type WeatherRiskWithRecommendations = WeatherRiskDetail & {
  recommendations: RiskRecommendation[]
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

  const risksWithRecommendations = nestRecommendationsIntoRisks(
    weather.risks as Record<string, unknown>,
    weather.recommendations as RiskRecommendation[] | null
  )

  const { recommendations: _recs, ...weatherWithoutRecs } = weather

  return {
    data: {
      ...weatherWithoutRecs,
      risks: risksWithRecommendations,
    },
  }
}

export async function createParcel(
  organizationId: string,
  data: ParcelCreateInput
): Promise<ParcelCreateOutput> {
  const { parcelData, location, hasLocation } = splitLocationInput(data)
  const fallbackAreaM2 = resolveParcelAreaM2(parcelData.areaM2)

  const computedAreaM2 = parcelData.polygon
    ? geoService.areaM2(parcelData.polygon)
    : null

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.parcels)
      .values({
        ...parcelData,
        organizationId,
        areaM2: computedAreaM2 ?? fallbackAreaM2,
      })
      .returning({
        id: schema.parcels.id,
        name: schema.parcels.name,
        cropType: schema.parcels.cropType,
        irrigationType: schema.parcels.irrigationType,
        areaM2: schema.parcels.areaM2,
        centroid: schema.parcels.centroid,
        polygon: schema.parcels.polygon,
        createdAt: schema.parcels.createdAt,
        updatedAt: schema.parcels.updatedAt,

        lat: geoService.lat(schema.parcels.centroid),
        lng: geoService.lng(schema.parcels.centroid),
      })

    if (!created) {
      throw new HTTPException(500, { message: "Parcel creation failed" })
    }

    if (hasLocation) {
      await tx.insert(schema.parcelLocation).values({
        parcelId: created.id,
        ...location,
      })
    }

    // opcional side-effect
    if (created.lat && created.lng) {
      queueMicrotask(() => {
        getStations(created.id, created.lat, created.lng).catch(() => {})
      })
    }

    return created
  })
}

export async function updateParcel(
  organizationId: string,
  parcelId: string,
  data: ParcelUpdateInput
): Promise<ParcelUpdateOutput> {
  const { parcelData, location } = splitLocationInput(data)
  const { areaM2, ...restParcelData } = parcelData

  const fallbackAreaM2 =
    areaM2 !== undefined ? resolveParcelAreaM2(areaM2) : null

  const computedAreaM2 = restParcelData.polygon
    ? geoService.areaM2(restParcelData.polygon)
    : null

  const shouldReassignStations =
    restParcelData.centroid !== undefined ||
    restParcelData.polygon !== undefined

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(schema.parcels)
      .set({
        ...restParcelData,
        areaM2: computedAreaM2 ?? fallbackAreaM2,
      })
      .where(
        and(
          eq(schema.parcels.organizationId, organizationId),
          eq(schema.parcels.id, parcelId)
        )
      )
      .returning({
        id: schema.parcels.id,
        name: schema.parcels.name,
        cropType: schema.parcels.cropType,
        irrigationType: schema.parcels.irrigationType,
        areaM2: schema.parcels.areaM2,
        centroid: schema.parcels.centroid,
        polygon: schema.parcels.polygon,
        createdAt: schema.parcels.createdAt,
        updatedAt: schema.parcels.updatedAt,

        lat: geoService.lat(schema.parcels.centroid),
        lng: geoService.lng(schema.parcels.centroid),
      })

    if (!updated) {
      throw new HTTPException(404, { message: "Parcel not found" })
    }

    await upsertParcelLocation(tx, updated.id, location)

    if (shouldReassignStations && updated.lat && updated.lng) {
      queueMicrotask(() => {
        getStations(updated.id, updated.lat!, updated.lng!).catch(() => {})
      })
    }

    return updated
  })
}

export async function deleteParcel(
  organizationId: string,
  parcelId: string
): Promise<void> {
  const [deleted] = await db
    .delete(schema.parcels)
    .where(
      and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, parcelId)
      )
    )
    .returning({ id: schema.parcels.id })

  if (!deleted) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }
}

export {
  getParcelsForMap,
  getParcelRecommendations,
  getParcelCropOverview,
  getParcelsCropOverviewsForDashboard,
  getParcelsRecommendationsForDashboard,
  getParcelsRisksForDashboard,
  resolvePrimaryParcelId,
} from "@/services/parcel-dashboard"
export {
  getParcelAgroclimateForDashboard,
  getParcelsWeatherComparisonForDashboard,
} from "@/services/parcel-agroclimate"
