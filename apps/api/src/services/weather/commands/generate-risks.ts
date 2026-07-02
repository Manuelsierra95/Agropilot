import { db, schema, eq, and, inArray } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import {
  getWeather,
} from "@workspace/scrapers"
import {
  computeSeedRisks,
  generateRecommendations,
  getOlivePhenology,
  type ParcelApiRiskDetail,
} from "@workspace/api/services/weather/domain/weathercloud"
import { todayIso } from "@workspace/api/services/shared/date-utils"

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

  const { weather, usedStationId } = result
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

  const { upsertGeneratedRecommendations } = await import(
    "@workspace/api/services/recommendations"
  )
  const { mapRiskRecommendationsToGenerated } = await import(
    "@workspace/api/services/recommendations/map-risk-recommendations"
  )

  await upsertGeneratedRecommendations(
    organizationId,
    parcelId,
    mapRiskRecommendationsToGenerated(parcelId, today, recommendations)
  )

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
