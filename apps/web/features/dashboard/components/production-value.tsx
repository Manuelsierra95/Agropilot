"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  BarYAxis,
  ChartTooltip,
  Grid,
  XAxis,
  YAxis,
  curveMonotoneX,
} from "@workspace/ui/components/charts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignMonthPoint {
  date: Date
  productionKg: number
  valueEur: number
  [key: string]: unknown
}

interface BarMonthPoint {
  month: string
  currentKg: number
  prevKg: number
  [key: string]: unknown
}

export interface ProductionValueProps {
  className?: string
  monthlyProductionKg: number[]
  prevMonthlyProductionKg: number[]
  lonjaPrice: number
  numOlivos: number
  campaignStartYear: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAMPAIGN_MONTHS = [
  "Oct",
  "Nov",
  "Dic",
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
]

const COLOR_CURRENT = "var(--muted-foreground)"
const COLOR_PREV = "var(--muted)"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAreaData(
  monthlyKg: number[],
  lonjaPrice: number,
  startYear: number
): CampaignMonthPoint[] {
  let accKg = 0
  let accEur = 0
  return monthlyKg.map((kg, i) => {
    accKg += kg
    accEur += Math.round(kg * lonjaPrice)
    return {
      date: new Date(startYear, 9 + i, 1),
      productionKg: accKg,
      valueEur: accEur,
    }
  })
}

function buildBarData(current: number[], prev: number[]): BarMonthPoint[] {
  return (
    CAMPAIGN_MONTHS.map((month, i) => ({
      month,
      currentKg: current[i] ?? 0,
      prevKg: prev[i] ?? 0,
    }))
      // Solo meses con producción en alguna de las dos campañas
      .filter((d) => d.currentKg > 0 || d.prevKg > 0)
  )
}

function formatKg(v: number): string {
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}K kg`
  return `${v} kg`
}

function formatEur(v: number): string {
  if (Math.abs(v) >= 1_000)
    return `${(v / 1_000).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}K €`
  return `${v.toLocaleString("es-ES")} €`
}

// ---------------------------------------------------------------------------
// Delta indicator (estilo OlivePrice)
// ---------------------------------------------------------------------------

function DeltaIndicator({
  current,
  previous,
  unit = "",
  label = "vs campaña anterior",
  decimals = 0,
}: {
  current: number
  previous: number
  unit?: string
  label?: string
  decimals?: number
}) {
  if (previous === 0) return null
  const diff = current - previous
  const pct = Math.round((diff / previous) * 100)
  const isUp = diff >= 0

  const diffFormatted =
    decimals > 0
      ? `${diff > 0 ? "+" : ""}${diff.toFixed(decimals)}${unit}`
      : `${diff > 0 ? "+" : ""}${Math.round(diff).toLocaleString("es-ES")}${unit}`

  return (
    <div className="flex items-start gap-1 text-xs font-medium">
      <div className="flex items-center gap-1">
        <div className="relative h-3.5 w-3.5">
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              isUp ? "bg-(--primary-income)" : "bg-(--primary-expense)"
            )}
          />
          {isUp ? (
            <ArrowUp className="absolute inset-0 m-auto h-2 w-2 text-black" />
          ) : (
            <ArrowDown className="absolute inset-0 m-auto h-2 w-2 text-black" />
          )}
        </div>
        <span
          className={cn(
            "font-semibold",
            isUp ? "text-(--primary-income)" : "text-(--primary-expense)"
          )}
        >
          {diffFormatted} ({isUp ? "+" : ""}
          {pct}%)
        </span>
      </div>
      <span className="font-normal text-muted-foreground">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KPI compacto — estilo OlivePrice
// ---------------------------------------------------------------------------

function KpiItem({
  label,
  value,
  unit,
  delta,
}: {
  label: string
  value: string
  unit?: string
  delta: React.ReactNode
}) {
  return (
    <CardContent className="flex flex-col gap-2 p-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {delta}
    </CardContent>
  )
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

export function ProductionValueKPIs({
  className,
  totalKg,
  totalEur,
  kgPorOlivo,
  eurPorOlivo,
  prevTotalKg,
  prevTotalEur,
  prevKgPorOlivo,
  prevEurPorOlivo,
}: {
  className?: string
  totalKg: number
  totalEur: number
  kgPorOlivo: number
  eurPorOlivo: number
  prevTotalKg: number
  prevTotalEur: number
  prevKgPorOlivo: number
  prevEurPorOlivo: number
}) {
  return (
    <div
      className={cn(
        "grid w-full min-w-0 grid-cols-2 items-start justify-start gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-8",
        className
      )}
    >
      {/* KPI 1 — Producción total */}
      <div className="min-w-0 bg-background">
        <KpiItem
          label="Producción total"
          value={totalKg.toLocaleString("es-ES")}
          unit="kg"
          delta={
            <DeltaIndicator
              current={totalKg}
              previous={prevTotalKg}
              unit=" kg"
            />
          }
        />
      </div>

      {/* KPI 2 — Valor estimado */}
      <div className="min-w-0 bg-background">
        <KpiItem
          label="Valor estimado"
          value={totalEur.toLocaleString("es-ES")}
          unit="€"
          delta={
            <DeltaIndicator
              current={totalEur}
              previous={prevTotalEur}
              unit=" €"
            />
          }
        />
      </div>

      {/* KPI 3 — kg por olivo */}
      <div className="min-w-0 bg-background">
        <KpiItem
          label="Producción por olivo"
          value={kgPorOlivo.toLocaleString("es-ES")}
          unit="kg"
          delta={
            <DeltaIndicator
              current={kgPorOlivo}
              previous={prevKgPorOlivo}
              unit=" kg"
              decimals={1}
            />
          }
        />
      </div>

      {/* KPI 4 — € por olivo */}
      <div className="min-w-0 bg-background">
        <KpiItem
          label="Valor por olivo"
          value={eurPorOlivo.toLocaleString("es-ES")}
          unit="€"
          delta={
            <DeltaIndicator
              current={eurPorOlivo}
              previous={prevEurPorOlivo}
              unit=" €"
            />
          }
        />
      </div>
    </div>
  )
}

export function ProductionValueAreaChart({
  className,
  areaData,
}: {
  className?: string
  areaData: CampaignMonthPoint[]
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-sm",
              "bg-(--muted-foreground)"
            )}
          />
          Producción acumulada (kg)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-sm",
              "bg-(--primary-income)"
            )}
          />
          Valor de venta (€)
        </span>
      </div>

      <AreaChart
        className="max-w-full min-w-0"
        aspectRatio="3 / 2"
        data={areaData}
        xDataKey="date"
        margin={{ top: 12, right: 16, bottom: 36, left: 44 }}
      >
        <Grid horizontal />
        <YAxis
          formatValue={(v) => {
            if (v === 0) return ""
            if (v >= 1_000) return `${Math.round(v / 1_000)}K`
            return String(v)
          }}
        />
        <Area
          curve={curveMonotoneX}
          dataKey="productionKg"
          stroke={COLOR_CURRENT}
          fill={COLOR_CURRENT}
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Area
          curve={curveMonotoneX}
          dataKey="valueEur"
          stroke="var(--primary-income)"
          fill="var(--primary-income)"
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <XAxis tickMode="data" />
        <ChartTooltip
          rows={(point) => {
            const p = point as CampaignMonthPoint
            const idx = (p.date.getMonth() - 9 + 12) % 12
            return [
              {
                color: COLOR_CURRENT,
                label: `${CAMPAIGN_MONTHS[idx]} · Producción acum.`,
                value: formatKg(p.productionKg),
              },
              {
                color: "var(--primary-income)",
                label: `${CAMPAIGN_MONTHS[idx]} · Valor acum.`,
                value: formatEur(p.valueEur),
              },
            ]
          }}
        />
      </AreaChart>
    </div>
  )
}

function ProductionValueBarChart({
  className,
  barData,
  campaignLabel,
  prevCampaignLabel,
}: {
  className?: string
  barData: BarMonthPoint[]
  campaignLabel: string
  prevCampaignLabel: string
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-sm",
              "bg-(--muted-foreground)"
            )}
          />
          {campaignLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={cn("inline-block h-2 w-2 rounded-sm", "bg-(--muted)")}
          />
          {prevCampaignLabel}
        </span>
      </div>

      <BarChart
        className="max-w-full min-w-0"
        data={barData}
        xDataKey="month"
        orientation="horizontal"
        barGap={0.2}
        aspectRatio="3 / 2"
        margin={{ top: 8, right: 12, bottom: 8, left: 36 }}
      >
        <Grid horizontal={false} vertical fadeVertical />
        <Bar dataKey="currentKg" fill={COLOR_CURRENT} lineCap={3} />
        <Bar dataKey="prevKg" fill={COLOR_PREV} lineCap={3} />
        <BarYAxis />
        <ChartTooltip
          showCrosshair={false}
          content={({ point }) => {
            const p = point as BarMonthPoint
            const diff =
              p.prevKg > 0 ? ((p.currentKg - p.prevKg) / p.prevKg) * 100 : null
            const isPositive = diff !== null && diff > 0
            const isNeutral = diff === 0

            return (
              <div className="flex flex-col gap-2 bg-secondary/80 p-3 text-sm">
                {/* Mes */}
                <p className="text-xs font-medium text-foreground">{p.month}</p>

                {/* Filas de valores */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "inline-block h-2 w-2 rounded-sm",
                          "bg-(--muted-foreground)"
                        )}
                      />
                      {campaignLabel}
                    </span>
                    <span className="text-xs font-medium tabular-nums">
                      {formatKg(p.currentKg)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "inline-block h-2 w-2 rounded-sm",
                          "bg-(--muted)"
                        )}
                      />
                      {prevCampaignLabel}
                    </span>
                    <span className="text-xs font-medium tabular-nums">
                      {formatKg(p.prevKg)}
                    </span>
                  </div>
                </div>

                {/* Separador + variación */}
                {diff !== null && (
                  <>
                    <div className="h-px bg-border" />
                    <p
                      className={cn(
                        "text-[11px] font-medium",
                        isNeutral
                          ? "text-muted-foreground"
                          : isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {isPositive ? "▲" : isNeutral ? "—" : "▼"}{" "}
                      {isPositive
                        ? "Crecimiento"
                        : isNeutral
                          ? "Sin cambios"
                          : "Caída"}{" "}
                      del{" "}
                      {Math.abs(diff).toLocaleString("es-ES", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      % sobre campaña anterior
                    </p>
                  </>
                )}
              </div>
            )
          }}
        />
      </BarChart>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductionValue({
  className,
  monthlyProductionKg,
  prevMonthlyProductionKg,
  lonjaPrice,
  numOlivos,
  campaignStartYear,
}: ProductionValueProps) {
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

  const campaignLabel = "Campaña Actual"
  const prevCampaignLabel = "Campaña Anterior"

  const areaData = buildAreaData(
    monthlyProductionKg,
    lonjaPrice,
    campaignStartYear
  )
  const barData = buildBarData(monthlyProductionKg, prevMonthlyProductionKg)

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
          Valores estimados basados en la producción acumulada y el precio de
          lonja.
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

          <ProductionValueBarChart
            className="@min-[720px]/production:col-start-1 @min-[720px]/production:row-start-2"
            barData={barData}
            campaignLabel={campaignLabel}
            prevCampaignLabel={prevCampaignLabel}
          />

          <ProductionValueAreaChart
            className="@min-[720px]/production:col-start-2 @min-[720px]/production:row-start-2"
            areaData={areaData}
          />
        </div>
      </CardContent>
    </Card>
  )
}
