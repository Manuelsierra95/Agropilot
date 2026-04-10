import { mockParcels } from "@/store/mockParcels"
import type { WeatherMetrics } from "@/store/parcel-weather.mock"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { AllModeSummary } from "./parcel-types"
import { formatNumber } from "./parcel-utils"

type ParcelKpiGridProps = {
  isAllSelected: boolean
  metrics?: WeatherMetrics
  allModeSummary: AllModeSummary
  olivePriceValue: number
  cropHealthValue: number
}

export function ParcelKpiGrid({
  isAllSelected,
  metrics,
  allModeSummary,
  olivePriceValue,
  cropHealthValue,
}: ParcelKpiGridProps) {
  return (
    <section className="mt-4 grid md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>
            {isAllSelected ? "Superficie total" : "Estrés hídrico 7 días"}
          </CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(allModeSummary.totalArea)} ha`
              : `${formatNumber(metrics?.waterDeficit7d ?? 0)} mm`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? `Parcelas activas: ${mockParcels.length}`
            : `Déficit 15d: ${formatNumber(metrics?.waterDeficit15d ?? 0)} mm`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            {isAllSelected ? "Lluvia media 30d" : "Lluvia acumulada"}
          </CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(allModeSummary.avgRain30d)} mm`
              : `${formatNumber(metrics?.rain30d ?? 0)} mm`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? "Promedio calculado sobre todas las parcelas"
            : `Últimos 7 días: ${formatNumber(metrics?.rain7d ?? 0)} mm`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Temperatura media</CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(allModeSummary.avgTemp)}°C`
              : `${formatNumber(metrics?.tempAvg ?? 0)}°C`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? "Media ponderada simple entre parcelas"
            : `Tendencia térmica: ${formatNumber(metrics?.tempTrend ?? 0, 2)}`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Mercado y salud del cultivo</CardDescription>
          <CardTitle className="text-2xl">
            {formatNumber(olivePriceValue, 2)} €/kg
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Índice de salud: {formatNumber(cropHealthValue, 0)} / 100
        </CardContent>
      </Card>
    </section>
  )
}
