import { env } from '@/lib/env'

/**
 * Tiempo de caché por defecto: 5 minutos
 */
const DEFAULT_CACHE_TIME = 5 * 60 * 1000

/**
 * Tiempo de caché configurado desde variables de entorno o por defecto
 */
export const CACHE_TIME = env.NEXT_PUBLIC_CACHE_TIME
  ? parseInt(env.NEXT_PUBLIC_CACHE_TIME, 10)
  : DEFAULT_CACHE_TIME

/**
 * Tipos de métricas disponibles en el sistema
 */
export type MetricType =
  | 'olive_price'
  | 'crop_health'
  | 'yield_estimate'
  | 'rainfall'
  | 'current_weather'
  | 'current_weather_temperature'
  | 'current_weather_humidity'
  | 'current_weather_wind'
  | 'previous_harvest'

/**
 * Lista de tipos de métricas como array
 */
export const METRIC_TYPES: MetricType[] = [
  'olive_price',
  'crop_health',
  'yield_estimate',
  'rainfall',
  'current_weather',
  'current_weather_temperature',
  'current_weather_humidity',
  'current_weather_wind',
  'previous_harvest',
]

/**
 * Métricas del dashboard principal
 * Estas son las métricas que se muestran en el dashboard
 */
export const DASHBOARD_METRIC_TYPES: MetricType[] = [
  'olive_price',
  'yield_estimate',
  'rainfall',
  'current_weather_temperature',
  'current_weather_humidity',
  'current_weather_wind',
  'previous_harvest',
  'crop_health',
]
