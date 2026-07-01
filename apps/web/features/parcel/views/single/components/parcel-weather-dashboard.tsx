"use client"

import * as React from "react"

import type { WeatherDaily, WeatherMetrics } from "@workspace/web/lib/parcel/types"

import { ParcelCropStatusCard } from "@workspace/web/features/parcel/views/single/components/parcel-crop-status-card"
import { ParcelDeficitChart } from "@workspace/web/features/parcel/views/single/components/parcel-deficit-chart"
import { ParcelRainBalanceChart } from "@workspace/web/features/parcel/views/single/components/parcel-rain-balance-chart"
import { ParcelTemperatureChart } from "@workspace/web/features/parcel/views/single/components/parcel-temperature-chart"
import { ParcelWaterBalanceChart } from "@workspace/web/features/parcel/views/single/components/parcel-water-balance-chart"
import { ParcelWeatherRiskCard } from "@workspace/web/features/parcel/views/single/components/parcel-weather-risk-card"
import type { ParcelApiResponse, ParcelItem } from "@workspace/web/features/parcel/lib/parcel-types"
import type { DailySeriesPoint } from "@workspace/web/features/parcel/lib/parcel-weather-types"

type ParcelWeatherDashboardProps = {
  activeParcel: ParcelItem
  daily: WeatherDaily[]
  metrics: WeatherMetrics
  apiResponse?: ParcelApiResponse
}

function buildDailySeries(
  daily: Array<WeatherDaily | ParcelApiResponse["daily"]["data"][number]>
): DailySeriesPoint[] {
  let accumulatedWaterDeficit = 0

  return daily.map((entry) => {
    const waterBalance = entry.waterBalance ?? 0
    accumulatedWaterDeficit += waterBalance

    const temperatureAverage = (entry.tempMin + entry.tempMax) / 2

    return {
      date: entry.date,
      tempMin: entry.tempMin,
      tempMax: entry.tempMax,
      precipitation: entry.precipitation,
      waterBalance,
      temperatureAverage,
      temperatureSpread: Math.max(entry.tempMax - entry.tempMin, 0),
      accumulatedWaterDeficit,
    }
  })
}

export function ParcelWeatherDashboard({
  activeParcel,
  daily,
  metrics,
  apiResponse,
}: ParcelWeatherDashboardProps) {
  const apiMetrics = apiResponse?.metrics ?? metrics
  const sourceDaily = apiResponse?.daily.data ?? daily

  const dailySeries = React.useMemo(
    () => buildDailySeries(sourceDaily),
    [sourceDaily]
  )

  const recentTemperatureSeries = React.useMemo(
    () =>
      dailySeries.slice(-7).map((entry) => ({
        date: entry.date,
        temperatureAverage: entry.temperatureAverage,
      })),
    [dailySeries]
  )

  const recommendation = apiResponse?.recommendations[0]

  const riskCards = apiResponse
    ? [
        { label: "Riesgo hídrico", ...apiResponse.risks.waterStress },
        { label: "Riesgo fúngico", ...apiResponse.risks.fungalRisk },
        { label: "Riesgo insectos", ...apiResponse.risks.insectRisk },
        { label: "Estrés térmico", ...apiResponse.risks.thermalStress },
      ]
    : [
        {
          label: "Riesgo hídrico",
          score: 0,
          level: "low" as const,
          reasons: ["Sin datos."],
        },
        {
          label: "Riesgo fúngico",
          score: 0,
          level: "low" as const,
          reasons: ["Sin datos."],
        },
        {
          label: "Riesgo insectos",
          score: 0,
          level: "low" as const,
          reasons: ["Sin datos."],
        },
        {
          label: "Estrés térmico",
          score: 0,
          level: "low" as const,
          reasons: ["Sin datos."],
        },
      ]

  return (
    <div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {riskCards.map((risk) => (
          <ParcelWeatherRiskCard key={risk.label} {...risk} />
        ))}
      </section>

      {/* <ParcelWaterBalanceChart dailySeries={dailySeries} /> */}
      <ParcelRainBalanceChart dailySeries={dailySeries} />

      <section className="grid xl:grid-cols-2">
        <ParcelDeficitChart dailySeries={dailySeries} />
        <ParcelTemperatureChart
          dailySeries={dailySeries}
          thresholds={{
            optimalMin: 10,
            optimalMax: 25,
            heatStressThreshold: 35,
            coldStressThreshold: 5,
          }}
        />
      </section>

      {/* <section className="grid xl:grid-cols-2">
        <ParcelCropStatusCard
          activeParcel={activeParcel}
          apiMetrics={apiMetrics}
          recentTemperatureSeries={recentTemperatureSeries}
          recommendation={recommendation}
        />
      </section> */}
    </div>
  )
}
