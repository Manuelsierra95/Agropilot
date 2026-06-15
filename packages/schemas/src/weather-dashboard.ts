import z from "zod"

export const weatherConditionSchema = z.enum([
  "sunny",
  "cloudy",
  "partly-cloudy",
  "rainy",
  "snowy",
])

export const weatherCurrentSchema = z.object({
  temperature: z.number(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  condition: weatherConditionSchema,
})

export const weatherForecastDaySchema = z.object({
  date: z.string().date(),
  condition: weatherConditionSchema,
  tempMax: z.number(),
  tempMin: z.number(),
  humidity: z.number(),
})

export const parcelWeatherQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

export const parcelWeatherResponseSchema = z.object({
  parcelId: z.string().uuid(),
  parcelName: z.string(),
  current: weatherCurrentSchema.nullable(),
  forecast: z.array(weatherForecastDaySchema),
})

export type WeatherCondition = z.infer<typeof weatherConditionSchema>
export type WeatherCurrent = z.infer<typeof weatherCurrentSchema>
export type WeatherForecastDay = z.infer<typeof weatherForecastDaySchema>
export type ParcelWeatherQuery = z.infer<typeof parcelWeatherQuerySchema>
export type ParcelWeatherResponse = z.infer<typeof parcelWeatherResponseSchema>
