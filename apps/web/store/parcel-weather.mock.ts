export type WeatherDaily = {
  date: string
  tempMax: number
  tempMin: number
  precipitation: number
  waterBalance?: number
  heatStress?: boolean
  coldStress?: boolean
  dryDay?: boolean
  tempChange?: number
  precipChange?: number
}

export type WeatherMetrics = {
  waterDeficit7d: number
  waterDeficit15d: number
  waterDeficit30d: number
  dryDaysConsecutive: number
  tempTrend: number
  rainTrend: number
  heatStressDays: number
  coldStressDays: number
  rain7d: number
  rain30d: number
  tempAvg: number
  variabilityIndex: number
}

export type WeatherRisks = {
  waterStress: "low" | "medium" | "high"
  pestRisk: "low" | "medium" | "high"
}

export type ParcelWeatherResult = {
  daily: WeatherDaily[]
  metrics: WeatherMetrics
  risks: WeatherRisks
  status?: "ok" | "no-data"
}

const MS_IN_DAY = 24 * 60 * 60 * 1000

function normalizeUtcDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

// Campaign runs Oct -> Sep. Start at Oct 1 of the current campaign.
function getCampaignStartUtc(today: Date) {
  const month = today.getUTCMonth()
  const year = month >= 9 ? today.getUTCFullYear() : today.getUTCFullYear() - 1
  return new Date(Date.UTC(year, 9, 1))
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function buildDailySeries(seed: number, today: Date): WeatherDaily[] {
  const start = getCampaignStartUtc(today)
  const startUtc = normalizeUtcDate(start)
  const endUtc = normalizeUtcDate(today)
  const totalDays =
    Math.floor((endUtc.getTime() - startUtc.getTime()) / MS_IN_DAY) + 1
  const daily: WeatherDaily[] = []

  let previousTempAvg = 0
  let previousPrecip = 0

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const date = new Date(startUtc.getTime() + dayIndex * MS_IN_DAY)
    const dayOfYear = Math.floor(
      (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / MS_IN_DAY
    )

    const seasonal = Math.sin((2 * Math.PI * (dayOfYear - 172)) / 365)
    const rainSeason = Math.max(
      0,
      Math.cos((2 * Math.PI * (dayOfYear - 10)) / 365)
    )
    const seedOffset = seed * 1000 + dayIndex
    const noiseA = (pseudoRandom(seedOffset + 1) - 0.5) * 2
    const noiseB = (pseudoRandom(seedOffset + 2) - 0.5) * 2
    const noiseC = (pseudoRandom(seedOffset + 3) - 0.5) * 2

    const tempBase = 17 + (seed % 5) - 2 + seasonal * 8 + noiseA * 0.8
    const tempSpread = 6 + (1 - seasonal) * 2.5 + Math.abs(noiseB) * 2
    const tempMin = round(tempBase - tempSpread / 2 - noiseC * 0.4, 1)
    const tempMax = round(tempBase + tempSpread / 2 + noiseC * 0.4, 1)

    const rainChance = 0.1 + 0.35 * rainSeason
    const rainRoll = pseudoRandom(seedOffset + 4)
    const rainIntensity =
      (0.3 + pseudoRandom(seedOffset + 5) * 1.4) * (0.8 + rainSeason * 6)
    const precipitation = rainRoll < rainChance ? round(rainIntensity, 1) : 0

    const eto = 2 + 2.8 * ((seasonal + 1) / 2)
    const waterBalance = round(precipitation - eto + noiseB * 0.4, 1)

    const tempAvg = (tempMax + tempMin) / 2
    const tempChange = dayIndex === 0 ? 0 : round(tempAvg - previousTempAvg, 1)
    const precipChange =
      dayIndex === 0 ? 0 : round(precipitation - previousPrecip, 1)

    daily.push({
      date: toIsoDate(date),
      tempMax,
      tempMin,
      precipitation,
      waterBalance,
      dryDay: precipitation === 0,
      heatStress: tempMax >= 35,
      coldStress: tempMin <= 4,
      tempChange,
      precipChange,
    })

    previousTempAvg = tempAvg
    previousPrecip = precipitation
  }

  return daily
}

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0)
}

function average(values: number[]) {
  return values.length > 0 ? sum(values) / values.length : 0
}

function stdDev(values: number[]) {
  if (values.length === 0) return 0
  const mean = average(values)
  const variance = average(values.map((value) => (value - mean) ** 2))
  return Math.sqrt(variance)
}

function buildMetrics(daily: WeatherDaily[]): WeatherMetrics {
  const last = (days: number) => daily.slice(-days)
  const previous = (days: number) => daily.slice(-(days * 2), -days)
  const sumWaterBalance = (entries: WeatherDaily[]) =>
    sum(entries.map((entry) => entry.waterBalance ?? 0))
  const sumRain = (entries: WeatherDaily[]) =>
    sum(entries.map((entry) => entry.precipitation))
  const avgTemp = (entries: WeatherDaily[]) =>
    average(entries.map((entry) => (entry.tempMax + entry.tempMin) / 2))

  const last7 = last(7)
  const last15 = last(15)
  const last30 = last(30)
  const prev7 = previous(7)

  const waterDeficit7d = round(Math.max(0, -sumWaterBalance(last7)), 1)
  const waterDeficit15d = round(Math.max(0, -sumWaterBalance(last15)), 1)
  const waterDeficit30d = round(Math.max(0, -sumWaterBalance(last30)), 1)

  const rain7d = round(sumRain(last7), 1)
  const rain30d = round(sumRain(last30), 1)
  const tempAvg = round(avgTemp(last30), 1)
  const tempTrend = round(avgTemp(last7) - avgTemp(prev7), 2)
  const rainTrend = round(sumRain(last7) - sumRain(prev7), 1)

  const heatStressDays = last30.filter((entry) => entry.tempMax >= 35).length
  const coldStressDays = last30.filter((entry) => entry.tempMin <= 4).length

  let dryDaysConsecutive = 0
  for (let index = daily.length - 1; index >= 0; index -= 1) {
    if (daily[index]?.precipitation !== 0) break
    dryDaysConsecutive += 1
  }

  const variabilityIndex = round(
    stdDev(last30.map((entry) => (entry.tempMax + entry.tempMin) / 2)) / 20,
    2
  )

  return {
    waterDeficit7d,
    waterDeficit15d,
    waterDeficit30d,
    dryDaysConsecutive,
    tempTrend,
    rainTrend,
    heatStressDays,
    coldStressDays,
    rain7d,
    rain30d,
    tempAvg,
    variabilityIndex,
  }
}

function buildRisks(metrics: WeatherMetrics): WeatherRisks {
  const waterStress =
    metrics.waterDeficit30d > 60
      ? "high"
      : metrics.waterDeficit30d > 30
        ? "medium"
        : "low"
  const pestRisk =
    metrics.rain30d > 60 ? "high" : metrics.rain30d > 30 ? "medium" : "low"

  return {
    waterStress,
    pestRisk,
  }
}

function buildParcelWeatherResult(
  seed: number,
  today: Date
): ParcelWeatherResult {
  const daily = buildDailySeries(seed, today)
  const metrics = buildMetrics(daily)
  const risks = buildRisks(metrics)

  return {
    status: "ok",
    daily,
    metrics,
    risks,
  }
}

const today = new Date()

export const parcelWeatherByParcelId: Record<string, ParcelWeatherResult> = {
  "1": buildParcelWeatherResult(11, today),
  "2": buildParcelWeatherResult(23, today),
  "3": buildParcelWeatherResult(37, today),
  "4": buildParcelWeatherResult(49, today),
}
