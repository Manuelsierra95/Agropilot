"use client"

import {
  Area,
  AreaChart,
  ChartTooltip,
  Grid,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
  XAxis,
  YAxis,
  curveMonotoneX,
} from "@workspace/ui/components/charts"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type ChartPoint = { date: Date; cost: number; value: number }

export type CampaignMarginData = {
  campaignStart: string
  points: { date: string; cost: number; value: number }[]
}

function toChartData(data: CampaignMarginData): ChartPoint[] {
  return data.points.map((point) => ({
    date: new Date(`${point.date}T12:00:00`),
    cost: point.cost,
    value: point.value,
  }))
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

export function CampaignAccumulatedMargin({
  className,
  data,
}: {
  className?: string
  data: CampaignMarginData
}) {
  const chartData = toChartData(data)
  const last = chartData.at(-1) ?? { cost: 0, value: 0, date: new Date() }

  const gap = last.value - last.cost
  const isProfit = gap >= 0
  const roi = last.cost > 0 ? (gap / last.cost) * 100 : 0

  // Primer punto donde el valor supera al coste (punto de equilibrio)
  const breakevenIdx = chartData.findIndex((d) => d.value >= d.cost)
  const breakevenLabel =
    breakevenIdx >= 0
      ? chartData[breakevenIdx].date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        })
      : null

  return (
    <Card className={cn("w-full min-w-0 bg-background ring-0", className)}>
      <CardHeader className="pb-2">
        {/* Cifra principal: gap actual */}
        <div
          className={cn(
            "text-2xl font-bold tracking-tight sm:text-3xl",
            isProfit ? "text-(--primary-income)" : "text-(--primary-expense)"
          )}
        >
          {isProfit ? "+" : ""}
          {formatCurrency(gap)}
        </div>

        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-muted-foreground">
            Beneficio acumulado estimado
          </span>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            {/* ROI */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-default items-center gap-1">
                    <div className="relative h-3.5 w-3.5">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full",
                          isProfit
                            ? "bg-(--primary-income)"
                            : "bg-(--primary-expense)"
                        )}
                      />
                      {isProfit ? (
                        <ArrowUp className="absolute inset-0 m-auto h-2 w-2 text-black" />
                      ) : (
                        <ArrowDown className="absolute inset-0 m-auto h-2 w-2 text-black" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-semibold",
                        isProfit
                          ? "text-(--primary-income)"
                          : "text-(--primary-expense)"
                      )}
                    >
                      {Math.abs(Math.round(roi))}% ROI
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-56 text-center">
                  <p className="text-xs">
                    Retorno sobre la inversión: cuánto genera cada euro
                    invertido en la campaña.{" "}
                    <span className="font-semibold">
                      {formatCurrency(last.cost)} invertidos →{" "}
                      {formatCurrency(last.value)} estimados
                    </span>
                    .
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Punto de equilibrio */}
            {breakevenLabel && (
              <span className="font-normal text-muted-foreground">
                · Equilibrio {breakevenLabel}
              </span>
            )}
          </div>
        </div>

        {/* Sub-métricas */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
          <div>
            <p className="text-xs text-muted-foreground">Coste acumulado</p>
            <p className="text-sm font-semibold">{formatCurrency(last.cost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor estimado</p>
            <p className="text-sm font-semibold text-(--primary-income)">
              {formatCurrency(last.value)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pr-4 pb-0">
        <AreaChart
          aspectRatio="3 / 1"
          data={chartData}
          xDataKey="date"
          margin={{ top: 16, right: 26, bottom: 40, left: 56 }}
        >
          <Grid horizontal />
          <YAxis formatValue={(v) => (v === 0 ? "" : formatCurrency(v))} />

          {/* Valor estimado — línea verde */}
          <Area
            curve={curveMonotoneX}
            dataKey="value"
            fadeEdges
            fillOpacity={0.3}
            strokeWidth={2}
            stroke="var(--primary-income)"
            fill="var(--primary-income)"
          />

          {/* Coste acumulado — línea roja */}
          <Area
            curve={curveMonotoneX}
            dataKey="cost"
            fadeEdges
            fillOpacity={0.2}
            strokeWidth={1.5}
            stroke="var(--primary-expense)"
            fill="var(--primary-expense)"
          />

          {/* Gap visual: zona roja (pérdida) → zona verde (beneficio) */}
          <SegmentBackground />
          <SegmentLineFrom />
          <SegmentLineTo />

          <XAxis numTicks={6} />
          <ChartTooltip
            rows={(point) => [
              {
                color: "var(--primary-income)",
                label: "Valor estimado",
                value: formatCurrency(point.value as number),
              },
              {
                color: "var(--primary-expense)",
                label: "Coste acumulado",
                value: formatCurrency(point.cost as number),
              },
            ]}
          />
        </AreaChart>
      </CardContent>
    </Card>
  )
}
