"use client"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"

import type { DailySeriesPoint } from "./parcel-weather-types"
import { formatLongDate, formatNumber, formatShortDate } from "./parcel-utils"

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

type ParcelRainBalanceChartProps = {
  dailySeries: DailySeriesPoint[]
}

export function ParcelRainBalanceChart({
  dailySeries,
}: ParcelRainBalanceChartProps) {
  return (
    <Card className="overflow-hidden bg-background ring-0">
      <CardHeader>
        <CardTitle>Rain + Water Balance</CardTitle>
        <CardDescription>
          Barras de precipitación y línea de balance hídrico para entender causa
          y efecto.
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
                  formatter={(value) => `${formatNumber(Number(value), 2)} mm`}
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
  )
}
