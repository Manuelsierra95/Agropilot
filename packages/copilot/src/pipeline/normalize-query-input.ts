import { COPILOT_REFERENCE_DATE } from "../schemas/copilot-intent-schema"

function parseToolInput(input: unknown): unknown {
  if (typeof input === "string") {
    try {
      return JSON.parse(input)
    } catch {
      return input
    }
  }
  return input
}

function defaultWeatherRange() {
  return { from: "2025-01-01", to: COPILOT_REFERENCE_DATE }
}

function normalizeMetric(value: unknown): unknown {
  if (typeof value !== "string") return value
  const key = value.toLowerCase().trim().replace(/\s+/g, "_")

  const aliases: Record<string, string> = {
    humedad: "soil_moisture",
    humedad_suelo: "soil_moisture",
    humedad_del_suelo: "soil_moisture",
    soil_moisture: "soil_moisture",
    soil_humidity: "soil_moisture",
    moisture: "soil_moisture",
    lluvia: "rainfall",
    precipitacion: "rainfall",
    precipitación: "rainfall",
    rainfall: "rainfall",
    rain: "rainfall",
    temperatura: "temperature",
    temperature: "temperature",
    temp: "temperature",
  }

  return aliases[key] ?? value
}

function normalizeSource(value: unknown): unknown {
  if (typeof value !== "string") return value
  const key = value.toLowerCase().trim()

  const aliases: Record<string, string> = {
    weather: "parcelWeather",
    parcel_weather: "parcelWeather",
    parcelweather: "parcelWeather",
    clima: "parcelWeather",
    market_prices: "marketPrices",
    marketprices: "marketPrices",
    precios: "marketPrices",
    parcel_cashflow: "parcelCashflow",
    cashflow: "parcelCashflow",
  }

  return aliases[key] ?? value
}

export function normalizeQuery(query: unknown): unknown {
  if (!query || typeof query !== "object") return query

  const raw = { ...(query as Record<string, unknown>) }
  raw.source = normalizeSource(raw.source)

  if (raw.metric !== undefined) {
    raw.metric = normalizeMetric(raw.metric)
  }

  const range = defaultWeatherRange()
  if (!raw.from || typeof raw.from !== "string") raw.from = range.from
  if (!raw.to || typeof raw.to !== "string") raw.to = range.to

  return raw
}

export function normalizeQueriesInObject(input: unknown): unknown {
  const parsed = parseToolInput(input)
  if (!parsed || typeof parsed !== "object") return parsed

  const raw = { ...(parsed as Record<string, unknown>) }
  const queries = raw.queries

  if (typeof queries === "string") {
    try {
      raw.queries = JSON.parse(queries)
    } catch {
      return parsed
    }
  }

  if (Array.isArray(raw.queries)) {
    raw.queries = raw.queries.map(normalizeQuery)
  }

  return raw
}

export function extractJsonFromText(text: string): unknown | null {
  const trimmed = text.trim()

  try {
    return JSON.parse(trimmed)
  } catch {
    // continue
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {
      // continue
    }
  }

  const braceStart = trimmed.indexOf("{")
  const braceEnd = trimmed.lastIndexOf("}")
  if (braceStart >= 0 && braceEnd > braceStart) {
    try {
      return JSON.parse(trimmed.slice(braceStart, braceEnd + 1))
    } catch {
      return null
    }
  }

  return null
}
