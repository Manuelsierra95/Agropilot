import type { ParcelApiResponse, ParcelItem } from "./parcel-types"
import type { WeatherDaily, WeatherMetrics } from "@/store/parcel-weather.mock"

import { ParcelWeatherDashboard } from "./parcel-weather-dashboard"

type ParcelSingleViewProps = {
  activeParcel: ParcelItem
  daily: WeatherDaily[]
  metrics: WeatherMetrics
  apiResponse?: ParcelApiResponse
}

export function ParcelSingleView({
  activeParcel,
  daily,
  metrics,
  apiResponse,
}: ParcelSingleViewProps) {
  return (
    <ParcelWeatherDashboard
      activeParcel={activeParcel}
      daily={daily}
      metrics={metrics}
      apiResponse={apiResponse}
    />
  )
}
