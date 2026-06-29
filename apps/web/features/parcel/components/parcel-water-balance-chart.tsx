"use client"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

import type { DailySeriesPoint } from "@workspace/web/features/parcel/components/parcel-weather-types"
import { formatLongDate, formatNumber, formatShortDate } from "@workspace/web/features/parcel/components/parcel-utils"

const waterBalanceChartConfig = {
  waterBalance: {
    label: "Balance hídrico",
    color: "oklch(0.61 0.13 162)",
  },
} satisfies ChartConfig

type ParcelWaterBalanceChartProps = {
  dailySeries: DailySeriesPoint[]
}

export function ParcelWaterBalanceChart({
  dailySeries,
}: ParcelWaterBalanceChartProps) {
  return (
    <Card className="overflow-hidden bg-background ring-0">
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
                  formatter={(value) => `${formatNumber(Number(value), 2)} mm`}
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
  )
}
