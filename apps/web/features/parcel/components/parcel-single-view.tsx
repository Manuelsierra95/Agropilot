import type { ParcelApiResponse, ParcelItem } from "@workspace/web/features/parcel/components/parcel-types"
import type { WeatherDaily, WeatherMetrics } from "@workspace/web/lib/parcel/types"
import { ParcelWeatherDashboard } from "@workspace/web/features/parcel/components/parcel-weather-dashboard"

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
