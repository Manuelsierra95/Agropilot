import type { ParcelApiResponse, ParcelItem } from "./parcel-types"
import type { WeatherDaily, WeatherMetrics } from "@/store/parcel-weather.mock"

import { KpiCard } from "./price-kpi-card"
import { olivarPriceKpis } from "./price-kpi-mock"
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
    <div className="mt-4 space-y-4">
      <div>
        <p className="mb-3 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Precios de Mercado
        </p>
        <KpiCard items={olivarPriceKpis} />
      </div>

      <ParcelWeatherDashboard
        activeParcel={activeParcel}
        daily={daily}
        metrics={metrics}
        apiResponse={apiResponse}
      />
    </div>
  )
}
