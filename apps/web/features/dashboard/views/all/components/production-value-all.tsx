"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  YAxis,
} from "@workspace/ui/components/charts"
import { buildParcelChartRows } from "@workspace/web/lib/charts/chart-parcel-categories"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import type {
  DashboardParcelFinanceComparisonItem,
  DashboardProductionValue,
} from "@workspace/schemas"

import type { ParcelCropOverviewItem } from "@workspace/web/features/dashboard/views/all/components/resume-crop-all"
import { ProductionValueKPIs } from "@workspace/web/features/dashboard/components/production-value"
import { useDashboardScopeActions } from "@workspace/web/hooks/use-dashboard-scope-actions"

type ProductionValueAllProps = DashboardProductionValue & {
  className?: string
  parcels: DashboardParcelFinanceComparisonItem[]
  cropOverviews: ParcelCropOverviewItem[]
}

function formatKg(v: number): string {
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}K kg`
  return `${v} kg`
}

function formatCurrency(v: number) {
  if (Math.abs(v) >= 1_000) {
    return `${(v / 1_000).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}K €`
  }
  return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function ParcelKPIsCompact({
  totalKg,
  totalEur,
  kgPorOlivo,
  eurPorOlivo,
}: {
  totalKg: number
  totalEur: number
  kgPorOlivo: number
  eurPorOlivo: number
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 @min-[480px]/production:grid-cols-4">
      <CompactMetric
        label="Producción"
        value={`${totalKg.toLocaleString("es-ES")} kg`}
      />
      <CompactMetric
        label="Valor est."
        value={`${totalEur.toLocaleString("es-ES")} €`}
      />
      <CompactMetric
        label="kg/olivo"
        value={kgPorOlivo.toLocaleString("es-ES")}
      />
      <CompactMetric
        label="€/olivo"
        value={`${eurPorOlivo.toLocaleString("es-ES")} €`}
      />
    </dl>
  )
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-muted-foreground uppercase">{label}</dt>
      <dd className="truncate text-xs font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export function ProductionValueAll({
  className,
  parcels,
  cropOverviews,
  monthlyProductionKg,
  prevMonthlyProductionKg,
  lonjaPrice,
  numOlivos,
}: ProductionValueAllProps) {
  const { selectParcel } = useDashboardScopeActions()
  const totalKg = monthlyProductionKg.reduce((a, b) => a + b, 0)
  const totalEur = Math.round(totalKg * lonjaPrice)
  const kgPorOlivo = totalKg > 0 ? +(totalKg / numOlivos).toFixed(1) : 0
  const eurPorOlivo = totalKg > 0 ? Math.round(totalEur / numOlivos) : 0

  const prevTotalKg = prevMonthlyProductionKg.reduce((a, b) => a + b, 0)
  const prevTotalEur = Math.round(prevTotalKg * lonjaPrice)
  const prevKgPorOlivo =
    prevTotalKg > 0 ? +(prevTotalKg / numOlivos).toFixed(1) : 0
  const prevEurPorOlivo =
    prevTotalKg > 0 ? Math.round(prevTotalEur / numOlivos) : 0

  const treesByParcelId = useMemo(
    () => new Map(cropOverviews.map((p) => [p.parcelId, p.totalTrees])),
    [cropOverviews]
  )

  const comparisonData = buildParcelChartRows(parcels, (p) => ({
    totalKg: p.totalKg,
    totalRevenue: Math.round(p.totalKg * lonjaPrice),
  }))

  return (
    <Card
      className={cn(
        "@container/production min-w-0 bg-background ring-0",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle>Producción y valor estimado</CardTitle>
        <CardDescription>
          Comparativa entre parcelas y KPIs por parcela.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 pb-4">
        <div className="grid min-w-0 grid-cols-1 gap-4 @min-[720px]/production:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @min-[720px]/production:gap-x-6">
          <ProductionValueKPIs
            className="col-span-full"
            totalKg={totalKg}
            totalEur={totalEur}
            kgPorOlivo={kgPorOlivo}
            eurPorOlivo={eurPorOlivo}
            prevTotalKg={prevTotalKg}
            prevTotalEur={prevTotalEur}
            prevKgPorOlivo={prevKgPorOlivo}
            prevEurPorOlivo={prevEurPorOlivo}
          />

          <div className="@min-[720px]/production:col-start-1 @min-[720px]/production:row-start-2">
            <div className="mb-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm bg-muted-foreground" />
                Producción (kg)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm bg-(--primary-income)" />
                Valor estimado (€)
              </span>
            </div>
            <BarChart
              className="max-w-full min-w-0"
              data={comparisonData}
              xDataKey="axisLabel"
              barGap={0.25}
              aspectRatio="4 / 3"
              margin={{ top: 8, right: 12, bottom: 36, left: 44 }}
            >
              <Grid horizontal />
              <YAxis />
              <Bar
                dataKey="totalKg"
                fill="var(--muted-foreground)"
                lineCap={3}
              />
              <Bar
                dataKey="totalRevenue"
                fill="var(--primary-income)"
                lineCap={3}
              />
              <BarXAxis showAllLabels />
              <ChartTooltip
                showCrosshair={false}
                content={({ point }) => {
                  const p = point as (typeof comparisonData)[number]
                  return (
                    <div className="flex flex-col gap-1 bg-secondary/90 p-3 text-xs">
                      <p className="font-medium">{p.fullName}</p>
                      <p>{formatKg(p.totalKg)}</p>
                      <p className="text-(--primary-income)">
                        Valor est.: {formatCurrency(p.totalRevenue)}
                      </p>
                    </div>
                  )
                }}
              />
            </BarChart>
          </div>

          <div className="flex min-h-0 flex-col @min-[720px]/production:col-start-2 @min-[720px]/production:row-start-2">
            <div className="mb-2 shrink-0 text-[11px] text-muted-foreground">
              KPIs por parcela
            </div>
            <ScrollArea className="h-full min-h-0 w-full md:max-h-[280px] xl:max-h-[500px]">
              <ul className="divide-y divide-border/40 pr-3 pb-1">
                {parcels.map((parcel) => {
                  const parcelTotalKg = parcel.totalKg
                  const parcelTotalEur = Math.round(parcelTotalKg * lonjaPrice)
                  const trees = treesByParcelId.get(parcel.parcelId) ?? 1
                  const parcelKgPorOlivo =
                    parcelTotalKg > 0 ? +(parcelTotalKg / trees).toFixed(1) : 0
                  const parcelEurPorOlivo =
                    parcelTotalKg > 0 ? Math.round(parcelTotalEur / trees) : 0

                  return (
                    <li key={parcel.parcelId}>
                      <button
                        type="button"
                        onClick={() => void selectParcel(parcel.parcelId)}
                        className="w-full py-2 text-left transition-colors first:pt-0 hover:bg-muted/40"
                      >
                        <p className="mb-1.5 truncate text-xs font-medium">
                          {parcel.name}
                        </p>
                        <ParcelKPIsCompact
                          totalKg={parcelTotalKg}
                          totalEur={parcelTotalEur}
                          kgPorOlivo={parcelKgPorOlivo}
                          eurPorOlivo={parcelEurPorOlivo}
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
