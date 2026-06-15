import { db, schema, eq, inArray } from "@workspace/db"
import {
  parcelWeatherDataSchema,
  type DashboardParcelAgroclimate,
  type DashboardParcelComparisonItem,
  type DashboardParcelsWeatherComparison,
  type DashboardScopeQuery,
} from "@workspace/schemas"
import {
  resolveActiveCampaign,
  resolveCampaignById,
  resolveScopeDateRange,
} from "@/services/campaign"
import { getParcelById, listParcels } from "@/services/parcel"
import {
  mapDbRecommendationsToDashboard,
  mapDbRisksToDashboard,
} from "@/services/parcel-dashboard-mappers"

type DailySeedEntry = {
  date: string
  soilMoisture: number
  rainfall: number
  temperature: number
}

type MappedDailyItem = DashboardParcelAgroclimate["daily"]["data"][number]

const AGROCLIMATE_UNITS: DashboardParcelAgroclimate["units"] = {
  daily: {
    tempMin: "°C",
    tempMax: "°C",
    precipitation: "mm",
    waterBalance: "mm",
  },
  metrics: {
    water: {
      deficit7d: "mm",
      deficit15d: "mm",
      deficit30d: "mm",
      eto7d: "mm",
      eto30d: "mm",
    },
    temperature: {
      avg7d: "°C",
      avg30d: "°C",
      trend: "°C",
      heatStressDays: "días",
      coldStressDays: "días",
    },
    rain: {
      rain7d: "mm",
      rain30d: "mm",
      trend: "mm",
      dryDaysConsecutive: "días",
      dryDays7d: "días",
    },
    crop: {
      gdd: "°C·día",
      gdd30d: "°C·día",
      kc: "",
    },
    environment: {
      humidityAvg7d: "%",
      humidityAvg30d: "%",
      variabilityIndex: "",
    },
  },
  risks: { score: "0-1" },
}

function parseWktPoint(
  wkt: string | null | undefined
): { lat: number; lng: number } | null {
  if (!wkt) return null
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (!match?.[1] || !match?.[2]) return null
  return { lng: Number(match[1]), lat: Number(match[2]) }
}

function deriveIcon(temperature: number, rainfall: number): string {
  if (rainfall >= 8) return "rainy"
  if (rainfall >= 2) return "cloudy"
  if (temperature >= 24 && rainfall < 1) return "sunny"
  if (temperature >= 18) return "partly-cloudy"
  return "cloudy"
}

function etoProxy(temperature: number): number {
  return Math.max(0, temperature * 0.15)
}

function mapDailyEntry(
  entry: DailySeedEntry,
  prevTemp?: number
): MappedDailyItem {
  const tempMin =
    prevTemp != null
      ? Math.min(entry.temperature, prevTemp)
      : entry.temperature - 2
  const tempMax = Math.max(entry.temperature, tempMin + 1)
  const precipitation = entry.rainfall
  const waterBalance = precipitation - etoProxy(entry.temperature)

  return {
    date: entry.date,
    icon: deriveIcon(entry.temperature, entry.rainfall),
    tempMin,
    tempMax,
    precipitation,
    waterBalance: Math.round(waterBalance * 10) / 10,
    hasWaterDeficit: waterBalance < -1,
  }
}

function sumWindow(
  items: MappedDailyItem[],
  days: number,
  fn: (item: MappedDailyItem) => number
): number {
  const slice = items.slice(-days)
  return Math.round(slice.reduce((acc, item) => acc + fn(item), 0) * 10) / 10
}

function avgWindow<T>(
  items: T[],
  days: number,
  fn: (item: T) => number
): number {
  const slice = items.slice(-days)
  if (slice.length === 0) return 0
  const sum = slice.reduce((acc, item) => acc + fn(item), 0)
  return Math.round((sum / slice.length) * 10) / 10
}

function countDryDays(items: MappedDailyItem[], days: number): number {
  return items.slice(-days).filter((d) => d.precipitation < 0.5).length
}

function consecutiveDryDays(items: MappedDailyItem[]): number {
  let count = 0
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i]!.precipitation < 0.5) count++
    else break
  }
  return count
}

function computeGdd(items: MappedDailyItem[]): number {
  return Math.round(
    items.reduce((acc, d) => {
      const avg = (d.tempMax + d.tempMin) / 2
      return acc + Math.max(0, avg - 10)
    }, 0)
  )
}

function computeMetrics(
  daily: MappedDailyItem[],
  rawEntries: DailySeedEntry[],
  cropDefaults: { kc?: number; stage?: string }
): DashboardParcelAgroclimate["metrics"] {
  const deficit = (days: number) =>
    Math.abs(
      Math.min(
        0,
        sumWindow(daily, days, (d) => d.waterBalance)
      )
    )

  const etoSum = (days: number) =>
    sumWindow(daily, days, (d) =>
      Math.max(0, etoProxy((d.tempMax + d.tempMin) / 2))
    )

  const avg7d = avgWindow(daily, 7, (d) => (d.tempMax + d.tempMin) / 2)
  const avg30d = avgWindow(daily, 30, (d) => (d.tempMax + d.tempMin) / 2)
  const rain7d = sumWindow(daily, 7, (d) => d.precipitation)
  const rain30d = sumWindow(daily, 30, (d) => d.precipitation)
  const prevRain7d =
    daily.length > 14
      ? daily
          .slice(-14, -7)
          .reduce((acc, d) => acc + d.precipitation, 0)
      : rain7d

  const heatStressDays = daily.filter((d) => d.tempMax > 35).length
  const coldStressDays = daily.filter((d) => d.tempMin < 0).length
  const humidityAvg7d = avgWindow(rawEntries, 7, (d) => d.soilMoisture)
  const humidityAvg30d = avgWindow(rawEntries, 30, (d) => d.soilMoisture)

  const gdd = computeGdd(daily)
  const gdd30d = computeGdd(daily.slice(-30))

  const temps = daily.map((d) => (d.tempMax + d.tempMin) / 2)
  const tempMean =
    temps.length > 0
      ? temps.reduce((a, b) => a + b, 0) / temps.length
      : 0
  const variance =
    temps.length > 1
      ? temps.reduce((acc, t) => acc + (t - tempMean) ** 2, 0) / temps.length
      : 0

  return {
    water: {
      deficit7d: deficit(7),
      deficit15d: deficit(15),
      deficit30d: deficit(30),
      eto7d: etoSum(7),
      eto30d: etoSum(30),
    },
    temperature: {
      avg7d,
      avg30d,
      trend: Math.round((avg7d - avg30d) * 10) / 10,
      heatStressDays,
      coldStressDays,
    },
    rain: {
      rain7d,
      rain30d,
      trend: Math.round((rain7d - prevRain7d) * 10) / 10,
      dryDaysConsecutive: consecutiveDryDays(daily),
      dryDays7d: countDryDays(daily, 7),
    },
    crop: {
      gdd,
      gdd30d,
      kc: cropDefaults.kc ?? 0.5,
      stage: cropDefaults.stage ?? "Vegetativo",
      isCritical: deficit(7) > 15 || heatStressDays > 3,
    },
    environment: {
      humidityAvg7d,
      humidityAvg30d,
      variabilityIndex: Math.round(Math.sqrt(variance) * 10) / 10,
    },
  }
}

function emptyAgroclimate(
  parcel: Awaited<ReturnType<typeof getParcelById>>,
  stationId: string,
  dateRange: { from: string; to: string }
): DashboardParcelAgroclimate {
  const coords = parseWktPoint(parcel.centroid ?? null) ?? {
    lat: 38,
    lng: -3.37,
  }

  const emptyMetrics = computeMetrics([], [], {})

  return {
    request: {
      parcelId: parcel.id,
      coords,
      cropType: parcel.cropType,
      cropName: parcel.name,
      days: 0,
    },
    summary: {
      stationId,
      lastUpdate: new Date().toISOString(),
    },
    dataRange: { start: dateRange.from, end: dateRange.to },
    daily: { data: [], recent: [] },
    metrics: emptyMetrics,
    risks: mapDbRisksToDashboard(null),
    units: AGROCLIMATE_UNITS,
    recommendations: [],
  }
}

async function resolveDateRangeForFilters(filters: DashboardScopeQuery) {
  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : filters.from && filters.to
      ? null
      : await resolveActiveCampaign()

  return resolveScopeDateRange(campaign, filters)
}

function parseAndFilterDaily(
  weatherData: unknown,
  dateRange: { from: string; to: string }
): DailySeedEntry[] {
  const parsed = parcelWeatherDataSchema.safeParse(weatherData)
  if (!parsed.success) return []

  return parsed.data.daily.filter(
    (entry) => entry.date >= dateRange.from && entry.date <= dateRange.to
  )
}

function buildDailySeries(entries: DailySeedEntry[]): MappedDailyItem[] {
  return entries.map((entry, index) =>
    mapDailyEntry(entry, entries[index - 1]?.temperature)
  )
}

function aggregateForComparison(
  daily: MappedDailyItem[]
): Omit<DashboardParcelComparisonItem, "name" | "area" | "waterStress"> {
  const rain30d = sumWindow(daily, 30, (d) => d.precipitation)
  const tempAvg = avgWindow(daily, 30, (d) => (d.tempMax + d.tempMin) / 2)
  const waterDeficit30d = Math.abs(
    Math.min(0, sumWindow(daily, 30, (d) => d.waterBalance))
  )

  return {
    rain30d,
    tempAvg,
    waterDeficit30d,
    dryDaysConsecutive: consecutiveDryDays(daily),
    heatStressDays: daily.filter((d) => d.tempMax > 35).length,
  }
}

export async function getParcelAgroclimateForDashboard(
  organizationId: string,
  parcelId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardParcelAgroclimate> {
  const parcel = await getParcelById(organizationId, parcelId)
  const dateRange = await resolveDateRangeForFilters(filters)

  const [weather, station] = await Promise.all([
    db.query.parcelWeather.findFirst({
      where: eq(schema.parcelWeather.parcelId, parcelId),
    }),
    db.query.parcelStation.findFirst({
      where: eq(schema.parcelStation.parcelId, parcelId),
    }),
  ])

  const stationId = station?.primaryStationId ?? "—"

  if (!weather || weather.status !== "ok") {
    return emptyAgroclimate(parcel, stationId, dateRange)
  }

  const rawEntries = parseAndFilterDaily(weather.data, dateRange)
  const dailyData = buildDailySeries(rawEntries)
  const recent = dailyData.slice(-14)

  const metricsDb = (weather.metrics ?? {}) as Record<string, unknown>
  const cropMetrics = (metricsDb.crop ?? {}) as Record<string, number | string>

  const coords = parseWktPoint(parcel.centroid ?? null) ?? {
    lat: 38,
    lng: -3.37,
  }

  return {
    request: {
      parcelId: parcel.id,
      coords,
      cropType: parcel.cropType,
      cropName: parcel.name,
      days: dailyData.length,
    },
    summary: {
      stationId,
      lastUpdate: weather.computedAt?.toISOString() ?? new Date().toISOString(),
    },
    dataRange: {
      start: dateRange.from,
      end: dateRange.to,
    },
    daily: {
      data: dailyData,
      recent,
    },
    metrics: computeMetrics(dailyData, rawEntries, {
      kc: Number(cropMetrics.kc ?? 0.5),
      stage: String(cropMetrics.stage ?? "Vegetativo"),
    }),
    risks: mapDbRisksToDashboard(weather.risks),
    units: AGROCLIMATE_UNITS,
    recommendations: mapDbRecommendationsToDashboard(weather.recommendations),
  }
}

export async function getParcelsWeatherComparisonForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardParcelsWeatherComparison> {
  const [parcels, dateRange] = await Promise.all([
    listParcels(organizationId),
    resolveDateRangeForFilters(filters),
  ])

  const parcelIds = parcels.map((p) => p.id)
  if (parcelIds.length === 0) {
    return { parcels: [] }
  }

  const weatherRows = await db.query.parcelWeather.findMany({
    where: inArray(schema.parcelWeather.parcelId, parcelIds),
  })
  const weatherByParcelId = new Map(
    weatherRows.map((row) => [row.parcelId, row])
  )

  const comparison: DashboardParcelComparisonItem[] = parcels.map((parcel) => {
    const weather = weatherByParcelId.get(parcel.id)
    const rawEntries =
      weather?.status === "ok"
        ? parseAndFilterDaily(weather.data, dateRange)
        : []
    const daily = buildDailySeries(rawEntries)
    const aggregated = aggregateForComparison(daily)
    const risks = mapDbRisksToDashboard(weather?.risks)

    return {
      name: parcel.name,
      area: parcel.areaHa ? Number(parcel.areaHa) : 0,
      ...aggregated,
      waterStress: risks.waterStress.level,
    }
  })

  return { parcels: comparison }
}
