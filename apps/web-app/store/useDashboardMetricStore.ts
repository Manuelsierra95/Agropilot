import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CACHE_TIME, MetricType } from '@/utils/constants'

export type { MetricType } from '@/utils/constants'

export interface Metric {
  id: number
  userId: string
  parcelId: number | null
  metricType: string
  value: number
  previousValue: number | null
  unit: string
  source: 'manual' | 'api' | 'sensor' | 'calculated'
  metadata: Record<string, any> | null
  date: string
  createdAt: string
  updatedAt: string
}

export interface GroupedMetrics {
  olive_price?: Metric[]
  crop_health?: Metric[]
  yield_estimate?: Metric[]
  rainfall?: Metric[]
  current_weather?: Metric[]
  current_weather_temperature?: Metric[]
  current_weather_humidity?: Metric[]
  current_weather_wind?: Metric[]
  previous_harvest?: Metric[]
}

export interface MetricsResponse {
  olive_price?: Metric[]
  crop_health?: Metric[]
  yield_estimate?: Metric[]
  rainfall?: Metric[]
  current_weather?: Metric[]
  current_weather_temperature?: Metric[]
  current_weather_humidity?: Metric[]
  current_weather_wind?: Metric[]
  previous_harvest?: Metric[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface ParcelMetricsCache {
  metrics: GroupedMetrics
  lastFetched: number
}

interface MetricState {
  metricsByParcel: Record<string, ParcelMetricsCache>
  setMetrics: (metricsResponse: MetricsResponse, parcelId: string) => void
  getMetrics: (parcelId: string) => GroupedMetrics
  addMetric: (metric: Metric, parcelId: string) => void
  removeMetric: (id: number, parcelId: string) => void
  updateMetric: (id: number, metric: Partial<Metric>, parcelId: string) => void
  clearMetrics: (parcelId?: string) => void
  isStale: (parcelId: string, maxAge?: number) => boolean
}

export const useMetricStore = create<MetricState>()(
  persist(
    (set, get) => ({
      metricsByParcel: {},

      setMetrics: (metricsResponse: MetricsResponse, parcelId: string) => {
        const { pagination, ...groupedMetrics } = metricsResponse
        set((state) => ({
          metricsByParcel: {
            ...state.metricsByParcel,
            [parcelId]: {
              metrics: groupedMetrics,
              lastFetched: Date.now(),
            },
          },
        }))
      },

      getMetrics: (parcelId: string) => {
        const cache = get().metricsByParcel[parcelId]
        return cache?.metrics || {}
      },

      addMetric: (metric: Metric, parcelId: string) =>
        set((state) => {
          const cache = state.metricsByParcel[parcelId]
          const currentMetrics = cache?.metrics || {}
          const metricType = metric.metricType as keyof GroupedMetrics
          const existingMetrics = currentMetrics[metricType] || []

          return {
            metricsByParcel: {
              ...state.metricsByParcel,
              [parcelId]: {
                metrics: {
                  ...currentMetrics,
                  [metricType]: [...existingMetrics, metric],
                },
                lastFetched: cache?.lastFetched || Date.now(),
              },
            },
          }
        }),

      removeMetric: (id: number, parcelId: string) =>
        set((state) => {
          const cache = state.metricsByParcel[parcelId]
          if (!cache) return state

          const newMetrics: GroupedMetrics = {}
          Object.entries(cache.metrics).forEach(([type, metricsArray]) => {
            if (metricsArray) {
              newMetrics[type as keyof GroupedMetrics] = metricsArray.filter(
                (m: Metric) => m.id !== id
              )
            }
          })

          return {
            metricsByParcel: {
              ...state.metricsByParcel,
              [parcelId]: {
                metrics: newMetrics,
                lastFetched: cache.lastFetched,
              },
            },
          }
        }),

      updateMetric: (
        id: number,
        updatedMetric: Partial<Metric>,
        parcelId: string
      ) =>
        set((state) => {
          const cache = state.metricsByParcel[parcelId]
          if (!cache) return state

          const newMetrics: GroupedMetrics = {}
          Object.entries(cache.metrics).forEach(([type, metricsArray]) => {
            if (metricsArray) {
              newMetrics[type as keyof GroupedMetrics] = metricsArray.map(
                (m: Metric) => (m.id === id ? { ...m, ...updatedMetric } : m)
              )
            }
          })

          return {
            metricsByParcel: {
              ...state.metricsByParcel,
              [parcelId]: {
                metrics: newMetrics,
                lastFetched: cache.lastFetched,
              },
            },
          }
        }),

      clearMetrics: (parcelId?: string) =>
        set((state) => {
          if (parcelId) {
            const { [parcelId]: _, ...rest } = state.metricsByParcel
            return { metricsByParcel: rest }
          }
          return { metricsByParcel: {} }
        }),

      isStale: (parcelId: string, maxAge = CACHE_TIME) => {
        const cache = get().metricsByParcel[parcelId]
        if (!cache) return true
        return Date.now() - cache.lastFetched > maxAge
      },
    }),
    {
      name: 'dashboard-metrics-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
