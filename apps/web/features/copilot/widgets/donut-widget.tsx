"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@workspace/ui/components/chart"

import type { DonutCell } from "@workspace/copilot"

export function DonutWidget({ cell }: { cell: DonutCell }) {
  const chartConfig = cell.slices.reduce<ChartConfig>((acc, slice, index) => {
    acc[`slice-${index}`] = {
      label: slice.category,
      color: slice.fill,
    }
    return acc
  }, {})

  const data = cell.slices.map((slice, index) => ({
    category: slice.category,
    amount: slice.amount,
    fill: slice.fill,
    key: `slice-${index}`,
  }))

  return (
    <Card className="flex min-h-[200px] flex-col bg-background ring-0">
      <CardHeader>
        <CardTitle className="text-base">{cell.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[180px] w-full max-w-[220px]"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={52}
              outerRadius={72}
              strokeWidth={2}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
