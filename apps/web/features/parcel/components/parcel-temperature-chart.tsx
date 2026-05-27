"use client"
import type { TooltipProps } from "recharts"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

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
  type ChartConfig,
} from "@workspace/ui/components/chart"

import type { DailySeriesPoint } from "./parcel-weather-types"
import { formatLongDate, formatNumber, formatShortDate } from "./parcel-utils"

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

// Colores semánticos centralizados
const ZONE_COLORS = {
  optimal: "oklch(0.72 0.17 142)", // verde
  heatStress: "oklch(0.64 0.17 28)", // naranja-rojo
  coldStress: "oklch(0.68 0.11 215)", // azul
} as const

type TemperatureThresholds = {
  /** Límite inferior del rango óptimo (°C) */
  optimalMin: number
  /** Límite superior del rango óptimo (°C) */
  optimalMax: number
  /** Por encima de este valor → estrés por calor (°C) */
  heatStressThreshold: number
  /** Por debajo de este valor → estrés por frío (°C) */
  coldStressThreshold: number
}

type ParcelTemperatureChartProps = {
  dailySeries: DailySeriesPoint[]
  thresholds: TemperatureThresholds
}

function TemperatureTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

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

export function ParcelTemperatureChart({
  dailySeries,
  thresholds,
}: ParcelTemperatureChartProps) {
  const { optimalMin, optimalMax, heatStressThreshold, coldStressThreshold } =
    thresholds

  const allTemps = dailySeries.flatMap((d) => [d.tempMin ?? 0, d.tempMax ?? 0])
  const yMin = Math.min(...allTemps, coldStressThreshold) - 2
  const yMax = Math.max(...allTemps, heatStressThreshold) + 2

  return (
    <Card className="overflow-hidden bg-background ring-0">
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
              <linearGradient id="temperatureBand" x1="0" y1="0" x2="0" y2="1">
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

            {/* ── Zona óptima ── */}
            <ReferenceArea
              y1={optimalMin}
              y2={optimalMax}
              fill={ZONE_COLORS.optimal}
              fillOpacity={0.08}
            />

            {/* ── Zona estrés por calor ── */}
            <ReferenceArea
              y1={heatStressThreshold}
              y2={yMax}
              fill={ZONE_COLORS.heatStress}
              fillOpacity={0.08}
            />

            {/* ── Zona estrés por frío ── */}
            <ReferenceArea
              y1={yMin}
              y2={coldStressThreshold}
              fill={ZONE_COLORS.coldStress}
              fillOpacity={0.08}
            />

            {/* ── Líneas de umbral ── */}
            <ReferenceLine
              y={heatStressThreshold}
              stroke={ZONE_COLORS.heatStress}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              label={{
                value: `⚠ Estrés calor (${heatStressThreshold} °C)`,
                position: "insideTopRight",
                fontSize: 11,
                fontWeight: 500,
                fill: ZONE_COLORS.heatStress,
                dy: 4,
              }}
            />
            <ReferenceLine
              y={coldStressThreshold}
              stroke={ZONE_COLORS.coldStress}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              label={{
                value: `⚠ Estrés frío (${coldStressThreshold} °C)`,
                position: "insideBottomRight",
                fontSize: 11,
                fontWeight: 500,
                fill: ZONE_COLORS.coldStress,
                dy: 0,
              }}
            />
            <ReferenceLine
              y={optimalMax}
              stroke={ZONE_COLORS.optimal}
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{
                value: `Óptimo máx. (${optimalMax} °C)`,
                position: "insideTopRight",
                fontSize: 11,
                fill: ZONE_COLORS.optimal,
                dy: 0,
              }}
            />
            <ReferenceLine
              y={optimalMin}
              stroke={ZONE_COLORS.optimal}
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{
                value: `Óptimo mín. (${optimalMin} °C)`,
                position: "insideBottomRight",
                fontSize: 11,
                fill: ZONE_COLORS.optimal,
                dy: 0,
              }}
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
              domain={[yMin, yMax]}
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
  )
}
