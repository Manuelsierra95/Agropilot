import { db, schema, eq, and, inArray } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import {
  parcelWeatherDataSchema,
  type ParcelWeatherQuery,
  type ParcelWeatherResponse,
  type WeatherCondition,
  type WeatherForecastDay,
} from "@workspace/schemas"
import { todayIso } from "@workspace/api/services/shared/date-utils"

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
