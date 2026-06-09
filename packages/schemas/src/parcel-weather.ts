import z from "zod"

export const parcelWeatherMetricSchema = z.enum([
  "soil_moisture",
  "rainfall",
  "temperature",
])

export const parcelWeatherDailyEntrySchema = z.object({
  date: z.string().date().describe("Fecha ISO YYYY-MM-DD"),
  soilMoisture: z.number().describe("Humedad del suelo (%)"),
  rainfall: z.number().describe("Precipitación acumulada (mm)"),
  temperature: z.number().describe("Temperatura (°C)"),
})

export const parcelWeatherDataSchema = z.object({
  daily: z
    .array(parcelWeatherDailyEntrySchema)
    .describe("Serie diaria de métricas climáticas de la parcela"),
})

export type ParcelWeatherMetric = z.infer<typeof parcelWeatherMetricSchema>
export type ParcelWeatherDailyEntry = z.infer<
  typeof parcelWeatherDailyEntrySchema
>
export type ParcelWeatherData = z.infer<typeof parcelWeatherDataSchema>

export const PARCEL_WEATHER_METRIC_LABELS: Record<ParcelWeatherMetric, string> =
  {
    soil_moisture: "Humedad del suelo",
    rainfall: "Precipitación",
    temperature: "Temperatura",
  }

export function metricLabel(metric: ParcelWeatherMetric): string {
  return PARCEL_WEATHER_METRIC_LABELS[metric]
}
