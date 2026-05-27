"use client"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { cn } from "@workspace/ui/lib/utils"

import type { WeatherMetrics } from "@/store/parcel-weather.mock"

import type { ParcelApiResponse, ParcelItem } from "./parcel-types"
import { formatLongDate, formatNumber } from "./parcel-utils"

const temperatureSparklineConfig = {
  temperatureAverage: {
    label: "Temperatura media diaria",
    color: "oklch(0.72 0.13 72)",
  },
} satisfies ChartConfig

type ParcelCropStatusCardProps = {
  activeParcel: ParcelItem
  apiMetrics: WeatherMetrics
  recentTemperatureSeries: Array<{ date: string; temperatureAverage: number }>
  recommendation?: ParcelApiResponse["recommendations"][number]
}

export function ParcelCropStatusCard({
  activeParcel,
  apiMetrics,
  recentTemperatureSeries,
  recommendation,
}: ParcelCropStatusCardProps) {
  const cropTrendText = `${formatNumber(apiMetrics.temperature.avg7d)} °C · ${formatNumber(
    apiMetrics.temperature.avg30d
  )} °C · Δ ${formatNumber(apiMetrics.temperature.trend, 1)} °C`

  return (
    <Card className="overflow-hidden bg-background ring-0">
      <CardHeader>
        <CardTitle>Crop Status</CardTitle>
        <CardDescription>
          {activeParcel.type} · {cropTrendText}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Etapa: {apiMetrics.crop.stage}</Badge>
            <Badge variant="outline">
              GDD: {formatNumber(apiMetrics.crop.gdd, 0)}
            </Badge>
            <Badge
              className={cn(
                apiMetrics.crop.isCritical
                  ? "border-red-500/40 bg-red-500/10 text-red-700"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
              )}
              variant="outline"
            >
              {apiMetrics.crop.isCritical ? "Estado crítico" : "Estado estable"}
            </Badge>
          </div>

          <div className="space-y-2 rounded-xl border border-border/30 bg-muted/20 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coeficiente Kc</span>
              <span className="font-medium">
                {formatNumber(apiMetrics.crop.kc, 2)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/80">
              <div
                className="h-full rounded-full bg-emerald-500/80 transition-[width] duration-700"
                style={{
                  width: `${Math.max(0, Math.min(apiMetrics.crop.kc, 1)) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El Kc ayuda a interpretar la demanda hídrica del cultivo en su
              fase actual.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/30 bg-muted/15 p-4">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                GDD 30d
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(apiMetrics.crop.gdd30d, 1)}
              </p>
            </div>
            <div className="rounded-xl border border-border/30 bg-muted/15 p-4">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Tendencia térmica
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(apiMetrics.temperature.trend, 1)} °C
              </p>
            </div>
          </div>

          {recommendation ? (
            <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Recomendación
                </span>
                <Badge variant="outline">{recommendation.priority}</Badge>
              </div>
              <p className="mt-2 font-medium">{recommendation.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {recommendation.details}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-xl border border-border/30 bg-muted/15 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Temperature Trend
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sparkline de la temperatura media diaria reciente.
              </p>
            </div>
            <Badge variant="outline">7 días</Badge>
          </div>

          <ChartContainer
            config={temperatureSparklineConfig}
            className="aspect-auto h-44 w-full"
          >
            <LineChart data={recentTemperatureSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `${formatNumber(Number(value), 1)} °C`
                    }
                    labelFormatter={(label) => formatLongDate(String(label))}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="temperatureAverage"
                stroke="var(--color-temperatureAverage)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ChartContainer>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Media 7d</span>
              <span className="font-medium text-foreground">
                {formatNumber(apiMetrics.temperature.avg7d, 1)} °C
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Media 30d</span>
              <span className="font-medium text-foreground">
                {formatNumber(apiMetrics.temperature.avg30d, 1)} °C
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Variación</span>
              <span className="font-medium text-foreground">
                {formatNumber(apiMetrics.temperature.trend, 1)} °C
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
