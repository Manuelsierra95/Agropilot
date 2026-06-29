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

export type WeatherCondition = z.infer<typeof weatherConditionSchema>
export type WeatherCurrent = z.infer<typeof weatherCurrentSchema>
export type WeatherForecastDay = z.infer<typeof weatherForecastDaySchema>
