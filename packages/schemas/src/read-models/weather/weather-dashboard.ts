import z from "zod"
import {
  weatherConditionSchema,
  weatherCurrentSchema,
  weatherForecastDaySchema,
} from "../../domain/weather"

export { weatherConditionSchema, weatherCurrentSchema, weatherForecastDaySchema }
export type { WeatherCondition, WeatherCurrent, WeatherForecastDay } from "../../domain/weather"

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

export type ParcelWeatherQuery = z.infer<typeof parcelWeatherQuerySchema>
export type ParcelWeatherResponse = z.infer<typeof parcelWeatherResponseSchema>
