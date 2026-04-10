import { create } from "zustand"

export interface Metric {
  value: number
  previousValue?: number
}

interface MetricData {
  [key: string]: Metric[]
}

// Mock data for development
const mockMetrics: Record<string, MetricData> = {
  parcel_1: {
    crop_health: [{ value: 85, previousValue: 78 }],
    current_weather_temperature: [{ value: 24, previousValue: 22 }],
    current_weather_humidity: [{ value: 65, previousValue: 62 }],
    current_weather_wind: [{ value: 12, previousValue: 10 }],
    olive_price: [{ value: 4.5, previousValue: 4.2 }],
    yield_estimate: [{ value: 3500, previousValue: 3200 }],
    rainfall: [{ value: 15.5, previousValue: 12.3 }],
    previous_harvest: [{ value: 5000, previousValue: 4800 }],
  },
}

interface MetricsStore {
  metrics: Record<string, MetricData>
  getMetrics: (parcelId: string) => MetricData
  setMetrics: (parcelId: string, data: MetricData) => void
}

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  metrics: mockMetrics,

  getMetrics: (parcelId: string): MetricData => {
    return get().metrics[parcelId] || {}
  },

  setMetrics: (parcelId: string, data: MetricData) => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        [parcelId]: data,
      },
    }))
  },
}))

// Helpers para uso fuera de componentes React (equivalente a las funciones originales)
export function getMetrics(parcelId: string): MetricData {
  return useMetricsStore.getState().getMetrics(parcelId)
}

export function setMetrics(parcelId: string, data: MetricData) {
  useMetricsStore.getState().setMetrics(parcelId, data)
}
