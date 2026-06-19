import { db, schema, eq, and, sql } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import {
  parcelWeatherDataSchema,
  type ParcelWeatherQuery,
  type ParcelWeatherResponse,
  type WeatherCondition,
  type WeatherForecastDay,
} from "@workspace/schemas"
import { resolveParcelIdForOrg } from "@/services/parcel"
import { computeSeedRisks, getOlivePhenology } from "./weathercloud"
import { getNearest, getWeather } from "./weathercloud/helpers"

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
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
  parcelIdParam: string,
  query: ParcelWeatherQuery = {}
): Promise<ParcelWeatherResponse> {
  const parcelId = await resolveParcelIdForOrg(organizationId, parcelIdParam)

  if (!parcelId) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

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

// TODO:
export async function getParcelRisks(
  organizationId: string,
  parcelIdParam: string
) {
  const parcelId = await resolveParcelIdForOrg(organizationId, parcelIdParam)

  if (!parcelId) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  const [parcel] = await db
    .select({
      id: schema.parcels.id,
      name: schema.parcels.name,
      cropType: schema.parcels.cropType,
      irrigationType: schema.parcels.irrigationType,
      lat: sql`ST_Y(${schema.parcels.centroid})`.as("lat"),
      lng: sql`ST_X(${schema.parcels.centroid})`.as("lng"),
    })
    .from(schema.parcels)
    .where(
      and(
        eq(schema.parcels.organizationId, organizationId),
        eq(schema.parcels.id, parcelId)
      )
    )
    .limit(1)

  if (!parcel) {
    throw new HTTPException(404, { message: "Parcel not found" })
  }

  const { lat, lng } = parcel

  if (lat == null || lng == null) {
    throw new HTTPException(400, { message: "Parcel has no valid coordinates" })
  }

  /* ---------------- 1. estaciones cercanas ---------------- */
  const devices = await getNearest(lat, lng, 20)

  if (!devices || !Array.isArray(devices) || devices.length === 0) {
    throw new HTTPException(500, { message: "No weather stations found" })
  }

  const nearest = devices[0]

  if (!nearest?.code) {
    throw new HTTPException(500, { message: "Invalid station data" })
  }

  /* ---------------- 2. clima ---------------- */
  const weather = await getWeather(nearest.code)

  if (!weather || "error" in weather) {
    throw new HTTPException(500, { message: "Failed to fetch weather" })
  }

  /* ---------------- 3. contexto agronómico ---------------- */
  const phenology = getOlivePhenology(new Date())

  const context = {
    crop: parcel.cropType ?? "unknown",
    irrigation: parcel.irrigationType !== "dry",
    phenology,
  }

  /* ---------------- 4. riesgos ---------------- */
  const risks = computeSeedRisks(
    {
      ...weather,
      device: nearest.id,
      distance: nearest.distance,
    },
    context
  )

  return {
    parcelId: parcel.id,
    parcelName: parcel.name,
    risks,
    meta: {
      stationId: nearest.id,
      distance: nearest.distance,
      phenology,
      crop: context.crop,
      irrigation: context.irrigation,
      updatedAt: weather.epoch,
    },
  }
}
