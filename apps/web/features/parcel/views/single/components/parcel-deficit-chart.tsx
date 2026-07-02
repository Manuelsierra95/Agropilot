"use client"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ReferenceArea,
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
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"

import type { DailySeriesPoint } from "@workspace/web/features/parcel/lib/parcel-weather-types"
import {
  formatLongDate,
  formatNumber,
  formatShortDate,
} from "@workspace/web/features/parcel/lib/parcel-utils"

const CRITICAL_THRESHOLD = -5

const deficitChartConfig = {
  accumulatedWaterDeficit: {
    label: "Déficit acumulado",
    color: "oklch(0.64 0.17 28)",
  },
} satisfies ChartConfig

type ParcelDeficitChartProps = {
  dailySeries: DailySeriesPoint[]
}

export function ParcelDeficitChart({ dailySeries }: ParcelDeficitChartProps) {
  const minValue = Math.min(
    ...dailySeries.map((d) => d.accumulatedWaterDeficit ?? 0)
  )
  const yAxisMin = Math.min(minValue, CRITICAL_THRESHOLD) - 2

  return (
    <Card className="overflow-hidden bg-background ring-0">
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

            {/* Zona crítica: relleno rojo translúcido por debajo del threshold */}
            <ReferenceArea
              y1={CRITICAL_THRESHOLD}
              y2={yAxisMin}
              fill="oklch(0.64 0.17 28)"
              fillOpacity={0.08}
            />

            {/* Línea de riesgo alto */}
            <ReferenceLine
              y={CRITICAL_THRESHOLD}
              stroke="oklch(0.64 0.17 28)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              label={{
                value: "⚠ Riesgo alto",
                position: "insideTopRight",
                fontSize: 11,
                fontWeight: 500,
                fill: "oklch(0.64 0.17 28)",
                dy: 4,
              }}
            />

            {/* Línea de referencia en 0 */}
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
              domain={[yAxisMin, "auto"]}
              tickFormatter={(value) => formatNumber(Number(value), 1)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${formatNumber(Number(value), 2)} mm`}
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
  )
}
