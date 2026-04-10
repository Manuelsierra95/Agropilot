import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"

import type { WeatherDaily, WeatherMetrics } from "@/store/parcel-weather.mock"

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

import type { ParcelItem } from "./parcel-types"
import { formatLongDate, formatNumber, formatShortDate } from "./parcel-utils"

const weatherChartConfig = {
  precipitation: {
    label: "Precipitación",
    color: "oklch(0.62 0.13 248)",
  },
  tempMax: {
    label: "T. máxima",
    color: "oklch(0.73 0.16 55)",
  },
  tempMin: {
    label: "T. mínima",
    color: "oklch(0.68 0.11 215)",
  },
} satisfies ChartConfig

const waterBalanceConfig = {
  waterBalance: {
    label: "Balance hídrico",
    color: "oklch(0.57 0.14 168)",
  },
} satisfies ChartConfig

type ParcelSingleViewProps = {
  activeParcel: ParcelItem
  daily: WeatherDaily[]
  metrics: WeatherMetrics
}

export function ParcelSingleView({
  activeParcel,
  daily,
  metrics,
}: ParcelSingleViewProps) {
  return (
    <>
      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Evolución diaria de clima</CardTitle>
            <CardDescription>
              Temperaturas máximas y mínimas junto con precipitación diaria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={weatherChartConfig}
              className="h-80 w-full rounded-lg"
            >
              <ComposedChart data={daily}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatShortDate}
                />
                <YAxis yAxisId="temp" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="rain"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelFormatter={formatLongDate} />
                  }
                />
                <Bar
                  yAxisId="rain"
                  dataKey="precipitation"
                  fill="var(--color-precipitation)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Line
                  yAxisId="temp"
                  dataKey="tempMax"
                  stroke="var(--color-tempMax)"
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                />
                <Line
                  yAxisId="temp"
                  dataKey="tempMin"
                  stroke="var(--color-tempMin)"
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance hídrico diario</CardTitle>
            <CardDescription>
              Valores negativos representan déficit hídrico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={waterBalanceConfig} className="h-80 w-full">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient
                    id="fillWaterBalance"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-waterBalance)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-waterBalance)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatShortDate}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        `${formatNumber(Number(value), 2)} mm`
                      }
                      labelFormatter={formatLongDate}
                    />
                  }
                />
                <Area
                  dataKey="waterBalance"
                  type="monotone"
                  fill="url(#fillWaterBalance)"
                  stroke="var(--color-waterBalance)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Resumen agronómico</CardTitle>
            <CardDescription>
              Indicadores derivados del histórico reciente de la parcela.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">
                Días secos consecutivos
              </span>
              <strong>{metrics.dryDaysConsecutive}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">
                Días de estrés térmico
              </span>
              <strong>{metrics.heatStressDays}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">
                Días de estrés por frío
              </span>
              <strong>{metrics.coldStressDays}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">
                Índice de variabilidad
              </span>
              <strong>{formatNumber(metrics.variabilityIndex, 2)}</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ficha de parcela</CardTitle>
            <CardDescription>
              Datos base de geometría y cultivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">Geometría</span>
              <strong>{activeParcel.geometryType}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">Puntos polígono</span>
              <strong>{activeParcel.geometryCoordinates[0]?.length}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">Cultivo</span>
              <strong>{activeParcel.type}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-muted-foreground">Riego</span>
              <strong>{activeParcel.irrigationType}</strong>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
