import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

import type { AllModeSummary, ParcelComparisonItem } from "./parcel-types"
import { formatNumber } from "./parcel-utils"
import { KpiCard } from "./price-kpi-card"
import { genericPriceKpis } from "./price-kpi-mock"

const comparisonChartConfig = {
  area: {
    label: "Superficie (ha)",
    color: "oklch(0.56 0.12 153)",
  },
  rain30d: {
    label: "Lluvia 30d (mm)",
    color: "oklch(0.61 0.13 248)",
  },
} satisfies ChartConfig

const allModeMetricsChartConfig = {
  waterDeficit30d: {
    label: "Déficit 30d (mm)",
    color: "oklch(0.67 0.14 31)",
  },
  tempAvg: {
    label: "T. media (°C)",
    color: "oklch(0.59 0.12 229)",
  },
} satisfies ChartConfig

const allModeStressChartConfig = {
  dryDaysConsecutive: {
    label: "Días secos consecutivos",
    color: "oklch(0.66 0.12 80)",
  },
  heatStressDays: {
    label: "Días de estrés térmico",
    color: "oklch(0.64 0.16 33)",
  },
} satisfies ChartConfig

type ParcelAllViewProps = {
  parcelComparisonData: ParcelComparisonItem[]
  allModeSummary: AllModeSummary
}

export function ParcelAllView({
  parcelComparisonData,
  allModeSummary,
}: ParcelAllViewProps) {
  return (
    <>
      <div className="mt-4">
        <p className="mb-3 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Precios de Mercado
        </p>
        <KpiCard items={genericPriceKpis} />
      </div>
      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Comparativa entre parcelas</CardTitle>
            <CardDescription>
              Diferencias de superficie y lluvia acumulada en 30 días.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={comparisonChartConfig}
              className="h-70 w-full"
            >
              <BarChart data={parcelComparisonData} barGap={8}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="area"
                  fill="var(--color-area)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="rain30d"
                  fill="var(--color-rain30d)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lectura rápida</CardTitle>
            <CardDescription>
              Parcela con mayor presión hídrica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border px-3 py-2">
              <p className="text-muted-foreground">Mayor déficit 30d</p>
              <p className="font-semibold">{allModeSummary.maxDeficit?.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(allModeSummary.maxDeficit?.waterDeficit30d ?? 0)}{" "}
                mm
              </p>
            </div>
            <div className="rounded-lg border px-3 py-2">
              <p className="text-muted-foreground">Mayor sequía continua</p>
              <p className="font-semibold">{allModeSummary.maxDry?.name}</p>
              <p className="text-xs text-muted-foreground">
                {allModeSummary.maxDry?.dryDaysConsecutive ?? 0} días
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Temperatura vs déficit hídrico</CardTitle>
            <CardDescription>
              Diferencias de comportamiento entre parcelas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={allModeMetricsChartConfig}
              className="h-80 w-full"
            >
              <BarChart data={parcelComparisonData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="waterDeficit30d"
                  fill="var(--color-waterDeficit30d)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="tempAvg"
                  fill="var(--color-tempAvg)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sequía y estrés térmico</CardTitle>
            <CardDescription>
              Contraste de días secos y eventos de calor por parcela.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={allModeStressChartConfig}
              className="h-80 w-full"
            >
              <BarChart data={parcelComparisonData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="dryDaysConsecutive"
                  fill="var(--color-dryDaysConsecutive)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="heatStressDays"
                  fill="var(--color-heatStressDays)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
