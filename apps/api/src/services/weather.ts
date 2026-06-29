import { db, schema, eq, and, sql, inArray } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import {
  parcelWeatherDataSchema,
  type ParcelWeatherQuery,
  type ParcelWeatherResponse,
  type WeatherCondition,
  type WeatherForecastDay,
} from "@workspace/schemas"
import {
  computeSeedRisks,
  generateRecommendations,
  getOlivePhenology,
  type ParcelApiRiskDetail,
} from "./weathercloud"
import {
  getBestStations,
  getWeather,
  type StationCandidate,
} from "@workspace/scrapers"
import { geoService } from "./geometry-utils"

export type ParcelRisksResponse = {
  parcelId: string
  parcelName: string
  risks: {
    waterStress?: ParcelApiRiskDetail
    fungalRisk?: ParcelApiRiskDetail
    insectRisk?: ParcelApiRiskDetail
    thermalStress?: ParcelApiRiskDetail
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

function pointWkt(lng: number, lat: number): string {
  return `POINT(${lng} ${lat})`
}

async function ensureWeatherStation(
  tx: DbTransaction,
  device: StationCandidate
): Promise<string> {
  const existing = await tx.query.weatherStation.findFirst({
    where: eq(schema.weatherStation.stationId, device.code),
    columns: { id: true },
  })
  if (existing) return existing.id

  const [created] = await tx
    .insert(schema.weatherStation)
    .values({
      id: crypto.randomUUID(),
      stationId: device.code,
      name: device.name,
      location: pointWkt(device.longitude, device.latitude),
      altitude: device.elevation,
    })
    .returning({ id: schema.weatherStation.id })
  return created!.id
}

async function upsertParcelStation(
  tx: DbTransaction,
  parcelId: string,
  primaryStationId: string,
  fallbacks: { stationId: string; distanceKm: number }[]
) {
  const existing = await tx.query.parcelStation.findFirst({
    where: eq(schema.parcelStation.parcelId, parcelId),
    columns: { parcelId: true },
  })

  const data = {
    primaryStationId,
    fallbackStations: fallbacks,
    computedAt: new Date(),
  }

  if (existing) {
    await tx
      .update(schema.parcelStation)
      .set(data)
      .where(eq(schema.parcelStation.parcelId, parcelId))
  } else {
    await tx.insert(schema.parcelStation).values({ parcelId, ...data })
  }
}

function deriveCondition(
  temperature: number,
  rainfall: number
): WeatherCondition {
  if (rainfall >= 8) return "rainy"
  if (rainfall >= 2) return "cloudy"
  if (temperature >= 24 && rainfall < 1) return "sunny"
  if (temperature >= 18) return "partly-cloudy"
  return "cloudy"
}

function mapDailyToForecast(
  entry: {
    date: string
    soilMoisture: number
    rainfall: number
    temperature: number
  },
  prevTemp?: number
): WeatherForecastDay {
  const tempMin =
    prevTemp != null
      ? Math.min(entry.temperature, prevTemp)
      : entry.temperature - 2
  const tempMax = Math.max(entry.temperature, tempMin + 1)

  return {
    date: entry.date,
    condition: deriveCondition(entry.temperature, entry.rainfall),
    tempMax,
    tempMin,
    humidity: entry.soilMoisture,
  }
}

export async function getParcelWeatherForCalendar(
  organizationId: string,
  parcelId: string,
  query: ParcelWeatherQuery = {}
): Promise<ParcelWeatherResponse> {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { id: true, name: true },
  })

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  const weather = await db.query.parcelWeather.findFirst({
    where: eq(schema.parcelWeather.parcelId, parcelId),
    columns: { status: true, data: true },
  })

  if (!weather || weather.status !== "ok") {
    return {
      parcelId: parcel.id,
      parcelName: parcel.name,
      current: null,
      forecast: [],
    }
  }

  const parsed = parcelWeatherDataSchema.safeParse(weather.data)
  if (!parsed.success) {
    return {
      parcelId: parcel.id,
      parcelName: parcel.name,
      current: null,
      forecast: [],
    }
  }

  const from = query.from ?? todayIso()
  const to = query.to ?? from

  const filtered = parsed.data.daily.filter(
    (entry) => entry.date >= from && entry.date <= to
  )

  const forecast: WeatherForecastDay[] = filtered.map((entry, index) =>
    mapDailyToForecast(
      entry,
      index > 0 ? filtered[index - 1]!.temperature : undefined
    )
  )

  const todayEntry =
    parsed.data.daily.find((entry) => entry.date === todayIso()) ??
    parsed.data.daily.at(-1)

  const current = todayEntry
    ? {
        temperature: todayEntry.temperature,
        humidity: todayEntry.soilMoisture,
        condition: deriveCondition(todayEntry.temperature, todayEntry.rainfall),
      }
    : null

  return {
    parcelId: parcel.id,
    parcelName: parcel.name,
    current,
    forecast,
  }
}

export async function getStations(
  parcelId: string,
  lat?: number,
  lng?: number
): Promise<void> {
  if (lat == null || lng == null) {
    const [parcel] = await db
      .select({
        lat: geoService.lat(schema.parcels.centroid),
        lng: geoService.lng(schema.parcels.centroid),
      })
      .from(schema.parcels)
      .where(eq(schema.parcels.id, parcelId))
      .limit(1)

    if (!parcel) return

    const coords = parcel as { lat: number; lng: number }
    lat = coords.lat
    lng = coords.lng
  }

  if (lat == null || lng == null) return

  const selection = await getBestStations(lat, lng)

  await db.transaction(async (tx) => {
    const mainStationId = await ensureWeatherStation(tx, selection.main)
    const fallbackIds = await Promise.all(
      selection.fallbacks.map((fb) => ensureWeatherStation(tx, fb))
    )
    await upsertParcelStation(
      tx,
      parcelId,
      mainStationId,
      selection.fallbacks.map((fb, i) => ({
        stationId: fallbackIds[i]!,
        distanceKm: fb.distance,
      }))
    )
  })
}

async function fetchWeatherWithFallback(
  primaryCode: string | undefined,
  fallbacks: { stationId: string; distanceKm: number }[],
  stationCodeMap: Map<string, string>
): Promise<{
  weather: any
  usedStationId: string
  usedDistanceKm: number
} | null> {
  if (primaryCode) {
    const weather = await getWeather(primaryCode as any)
    if (weather && !("error" in weather)) {
      return { weather, usedStationId: "", usedDistanceKm: 0 }
    }
  }

  for (const fb of fallbacks) {
    const fbCode = stationCodeMap.get(fb.stationId)
    if (!fbCode) continue

    const weather = await getWeather(fbCode as any)
    if (weather && !("error" in weather)) {
      return {
        weather,
        usedStationId: fb.stationId,
        usedDistanceKm: fb.distanceKm,
      }
    }
  }

  return null
}

export async function generateParcelRisks(
  organizationId: string,
  parcelId: string
): Promise<ParcelRisksResponse> {
  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.organizationId, organizationId),
      eq(schema.parcels.id, parcelId)
    ),
    columns: { id: true, name: true, cropType: true, irrigationType: true },
    with: {
      station: {
        columns: { primaryStationId: true, fallbackStations: true },
        with: {
          primaryStation: { columns: { id: true, stationId: true } },
        },
      },
    },
  })

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  const parcelStation = parcel.station

  if (!parcelStation) {
    throw new HTTPException(404, {
      message: "No weather stations found for this parcel",
    })
  }

  const stationCodeMap = new Map<string, string>()
  if (parcelStation.primaryStation) {
    stationCodeMap.set(
      parcelStation.primaryStation.id,
      parcelStation.primaryStation.stationId
    )
  }

  if (parcelStation.fallbackStations.length > 0) {
    const fallbackIds = parcelStation.fallbackStations.map((fb) => fb.stationId)
    const fallbackRows = await db
      .select({
        id: schema.weatherStation.id,
        stationId: schema.weatherStation.stationId,
      })
      .from(schema.weatherStation)
      .where(inArray(schema.weatherStation.id, fallbackIds))

    for (const row of fallbackRows) {
      stationCodeMap.set(row.id, row.stationId)
    }
  }

  const result = await fetchWeatherWithFallback(
    parcelStation.primaryStation?.stationId,
    parcelStation.fallbackStations,
    stationCodeMap
  )

  if (!result) {
    throw new HTTPException(500, {
      message: "Failed to fetch weather from all available stations",
    })
  }

  const { weather, usedStationId, usedDistanceKm } = result
  const usedStationCode = usedStationId
    ? (stationCodeMap.get(usedStationId) ?? "unknown")
    : (parcelStation.primaryStation?.stationId ?? "unknown")

  const phenology = getOlivePhenology(new Date())

  const context = {
    crop: parcel.cropType ?? "unknown",
    irrigation: parcel.irrigationType !== "dryland",
    phenology,
  }

  const risks = computeSeedRisks(weather, context)
  const recommendations = generateRecommendations(weather, risks, context)

  const today = todayIso()
  const weatherRow = {
    rangeStart: today,
    rangeEnd: today,
    status: "ok" as const,
    data: {
      daily: [
        {
          date: today,
          soilMoisture: weather.hum ?? 0,
          rainfall: weather.rainrate ?? weather.rain ?? 0,
          temperature: weather.temp ?? 0,
        },
      ],
    },
    metrics: {
      temp: weather.temp,
      hum: weather.hum,
      wspd: weather.wspd,
      rainrate: weather.rainrate,
      bar: weather.bar,
      computed: weather.computed,
    },
    risks,
    recommendations,
    computedAt: new Date(),
    algorithmVersion: "v1",
  }

  await db
    .insert(schema.parcelWeather)
    .values({ id: crypto.randomUUID(), parcelId, ...weatherRow })
    .onConflictDoUpdate({
      target: schema.parcelWeather.parcelId,
      set: weatherRow,
    })

  const recMap = new Map(recommendations.map((r) => [r.riskType, r]))

  function toDetail(
    risk: { level?: string; score?: number; reasons?: string[] } | undefined,
    riskType: Parameters<typeof recMap.get>[0]
  ): ParcelApiRiskDetail | undefined {
    if (!risk) return undefined
    return {
      level: (risk.level ?? "low") as ParcelApiRiskDetail["level"],
      score: risk.score ?? 0,
      reasons: risk.reasons ?? [],
      recommendation: recMap.get(riskType),
    }
  }

  return {
    parcelId: parcel.id,
    parcelName: parcel.name,
    risks: {
      waterStress: toDetail(risks.waterStress, "waterStress"),
      fungalRisk: toDetail(risks.fungalRisk, "fungalRisk"),
      insectRisk: toDetail(risks.insectRisk, "insectRisk"),
      thermalStress: toDetail(risks.thermalStress, "thermalStress"),
    },
  }
}
