"use client"

import * as React from "react"
import type { TooltipProps } from "recharts"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

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

import type { WeatherDaily, WeatherMetrics } from "@/store/parcel-weather.mock"

import type { ParcelApiResponse, ParcelItem } from "./parcel-types"
import {
  formatLongDate,
  formatNumber,
  formatShortDate,
  riskToBadgeClass,
  riskToLabel,
} from "./parcel-utils"

type DailySeriesPoint = {
  date: string
  tempMin: number
  tempMax: number
  precipitation: number
  waterBalance: number
  temperatureAverage: number
  temperatureSpread: number
  accumulatedWaterDeficit: number
}

const waterBalanceChartConfig = {
  waterBalance: {
    label: "Balance hídrico",
    color: "oklch(0.61 0.13 162)",
  },
} satisfies ChartConfig

const rainBalanceChartConfig = {
  precipitation: {
    label: "Precipitación",
    color: "oklch(0.62 0.13 248)",
  },
  waterBalance: {
    label: "Balance hídrico",
    color: "oklch(0.61 0.13 162)",
  },
} satisfies ChartConfig

const temperatureChartConfig = {
  tempMin: {
    label: "T. mínima",
    color: "oklch(0.68 0.11 215)",
  },
  tempMax: {
    label: "T. máxima",
    color: "oklch(0.73 0.16 55)",
  },
} satisfies ChartConfig

const deficitChartConfig = {
  accumulatedWaterDeficit: {
    label: "Déficit acumulado",
    color: "oklch(0.64 0.17 28)",
  },
} satisfies ChartConfig

const temperatureSparklineConfig = {
  temperatureAverage: {
    label: "Temperatura media diaria",
    color: "oklch(0.72 0.13 72)",
  },
} satisfies ChartConfig

type ParcelWeatherDashboardProps = {
  activeParcel: ParcelItem
  daily: WeatherDaily[]
  metrics: WeatherMetrics
  apiResponse?: ParcelApiResponse
}

function getRiskDotClass(level: "low" | "medium" | "high") {
  if (level === "high") return "bg-red-500"
  if (level === "medium") return "bg-amber-500"
  return "bg-emerald-500"
}

function buildDailySeries(
  daily: Array<WeatherDaily | ParcelApiResponse["daily"]["data"][number]>
) {
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

function RiskCard({
  label,
  score,
  level,
  reasons,
}: {
  label: string
  score: number
  level: "low" | "medium" | "high"
  reasons: string[]
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/25",
        level === "high" && "ring-1 ring-red-500/15",
        level === "medium" && "ring-1 ring-amber-500/15",
        level === "low" && "ring-1 ring-emerald-500/15"
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="mt-1 text-lg">{riskToLabel(level)}</CardTitle>
          </div>
          <Badge className={riskToBadgeClass(level)} variant="outline">
            {Math.round(score * 100)}%
          </Badge>
        </div>

        <div className="h-2 rounded-full bg-muted/70">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              getRiskDotClass(level)
            )}
            style={{ width: `${Math.max(0, Math.min(score, 1)) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
        {reasons.slice(0, 2).map((reason) => (
          <div key={reason} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-1 h-1.5 w-1.5 rounded-full",
                getRiskDotClass(level)
              )}
            />
            <p>{reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function TemperatureTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null
  }

  const tempMin = payload.find((item) => item.dataKey === "tempMin")?.value
  const tempMax = payload.find((item) => item.dataKey === "tempMax")?.value

  return (
    <div className="grid min-w-40 gap-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium text-foreground">
        {formatLongDate(String(label))}
      </div>
      <div className="flex items-center justify-between gap-3 text-muted-foreground">
        <span>Temperatura mínima</span>
        <span className="font-mono text-foreground">
          {tempMin === undefined
            ? "—"
            : `${formatNumber(Number(tempMin), 1)} °C`}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-muted-foreground">
        <span>Temperatura máxima</span>
        <span className="font-mono text-foreground">
          {tempMax === undefined
            ? "—"
            : `${formatNumber(Number(tempMax), 1)} °C`}
        </span>
      </div>
    </div>
  )
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

  const cropTrendText = `${formatNumber(apiMetrics.temperature.avg7d)} °C · ${formatNumber(
    apiMetrics.temperature.avg30d
  )} °C · Δ ${formatNumber(apiMetrics.temperature.trend, 1)} °C`

  const recommendation = apiResponse?.recommendations[0]

  return (
    <section className="mt-4 space-y-4">
      <section className="grid md:grid-cols-2 xl:grid-cols-4">
        {apiResponse
          ? [
              {
                label: "Riesgo hídrico",
                score: apiResponse.risks.waterStress.score,
                level: apiResponse.risks.waterStress.level,
                reasons: apiResponse.risks.waterStress.reasons,
              },
              {
                label: "Riesgo fúngico",
                score: apiResponse.risks.fungalRisk.score,
                level: apiResponse.risks.fungalRisk.level,
                reasons: apiResponse.risks.fungalRisk.reasons,
              },
              {
                label: "Riesgo insectos",
                score: apiResponse.risks.insectRisk.score,
                level: apiResponse.risks.insectRisk.level,
                reasons: apiResponse.risks.insectRisk.reasons,
              },
              {
                label: "Estrés térmico",
                score: apiResponse.risks.thermalStress.score,
                level: apiResponse.risks.thermalStress.level,
                reasons: apiResponse.risks.thermalStress.reasons,
              },
            ].map((risk) => <RiskCard key={risk.label} {...risk} />)
          : [
              {
                label: "Riesgo hídrico",
                score: 0,
                level: "low" as const,
                reasons: ["No hay response de API disponible."],
              },
              {
                label: "Riesgo fúngico",
                score: 0,
                level: "low" as const,
                reasons: ["Esperando respuesta de la API."],
              },
              {
                label: "Riesgo insectos",
                score: 0,
                level: "low" as const,
                reasons: ["Esperando respuesta de la API."],
              },
              {
                label: "Estrés térmico",
                score: 0,
                level: "low" as const,
                reasons: ["Esperando respuesta de la API."],
              },
            ].map((risk) => <RiskCard key={risk.label} {...risk} />)}
      </section>

      <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/30">
        <CardHeader>
          <CardTitle>Balance hídrico diario</CardTitle>
          <CardDescription>
            Métrica principal para decidir riego. Rojo indica déficit, verde
            indica superávit, con base en 0.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={waterBalanceChartConfig}
            className="aspect-auto h-80 w-full"
          >
            <BarChart data={dailySeries} barCategoryGap="30%">
              <CartesianGrid vertical={false} />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatShortDate}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(Number(value), 1)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `${formatNumber(Number(value), 2)} mm`
                    }
                    labelFormatter={(label) => formatLongDate(String(label))}
                  />
                }
              />
              <Bar dataKey="waterBalance" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {dailySeries.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={
                      entry.waterBalance >= 0
                        ? "oklch(0.63 0.13 154)"
                        : "oklch(0.62 0.18 28)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <section className="grid xl:grid-cols-2">
        <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/30">
          <CardHeader>
            <CardTitle>Rain + Water Balance</CardTitle>
            <CardDescription>
              Barras de precipitación y línea de balance hídrico para entender
              causa y efecto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={rainBalanceChartConfig}
              className="aspect-auto h-80 w-full"
            >
              <ComposedChart data={dailySeries}>
                <CartesianGrid vertical={false} />
                <ReferenceLine
                  y={0}
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(Number(value), 1)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        `${formatNumber(Number(value), 2)} mm`
                      }
                      labelFormatter={(label) => formatLongDate(String(label))}
                    />
                  }
                />
                <Bar
                  dataKey="precipitation"
                  fill="var(--color-precipitation)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={20}
                />
                <Line
                  type="monotone"
                  dataKey="waterBalance"
                  stroke="var(--color-waterBalance)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/30">
          <CardHeader>
            <CardTitle>Temperature Chart</CardTitle>
            <CardDescription>
              Evolución térmica con banda sombreada entre mínima y máxima.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={temperatureChartConfig}
              className="aspect-auto h-80 w-full"
            >
              <AreaChart data={dailySeries}>
                <defs>
                  <linearGradient
                    id="temperatureBand"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-tempMax)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-tempMax)"
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(Number(value), 0)}
                />
                <ChartTooltip content={<TemperatureTooltip />} />
                <Area
                  dataKey="tempMin"
                  stackId="temperature-band"
                  stroke="transparent"
                  fill="transparent"
                  dot={false}
                  activeDot={false}
                />
                <Area
                  dataKey="temperatureSpread"
                  stackId="temperature-band"
                  stroke="none"
                  fill="url(#temperatureBand)"
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tempMax"
                  stroke="var(--color-tempMax)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tempMin"
                  stroke="var(--color-tempMin)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid xl:grid-cols-2">
        <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/30">
          <CardHeader>
            <CardTitle>Accumulated Water Deficit</CardTitle>
            <CardDescription>
              Suma acumulada del balance diario para leer la deuda hídrica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={deficitChartConfig}
              className="aspect-auto h-72 w-full"
            >
              <LineChart data={dailySeries}>
                <CartesianGrid vertical={false} />
                <ReferenceLine
                  y={0}
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(Number(value), 1)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        `${formatNumber(Number(value), 2)} mm`
                      }
                      labelFormatter={(label) => formatLongDate(String(label))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="accumulatedWaterDeficit"
                  stroke="var(--color-accumulatedWaterDeficit)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/30">
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
                  {apiMetrics.crop.isCritical
                    ? "Estado crítico"
                    : "Estado estable"}
                </Badge>
              </div>

              <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
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
                <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    GDD 30d
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatNumber(apiMetrics.crop.gdd30d, 1)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    Tendencia térmica
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatNumber(apiMetrics.temperature.trend, 1)} °C
                  </p>
                </div>
              </div>

              {recommendation ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
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

            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-4">
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
                        labelFormatter={(label) =>
                          formatLongDate(String(label))
                        }
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
      </section>
    </section>
  )
}
