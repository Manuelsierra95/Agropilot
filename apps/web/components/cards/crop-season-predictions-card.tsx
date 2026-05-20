"use client"

import { TrendingDown, TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartTooltip,
  ComposedChart,
  Grid,
  Line,
  SeriesBar,
  XAxis,
  curveCatmullRom,
} from "@workspace/ui/components/charts"
import { cn } from "@workspace/ui/lib/utils"
import TooltipContent from "@workspace/ui/components/charts/tooltip/tooltip-content"

const rawData = [
  { date: new Date(2025, 9, 1), production: 5200, cost: 3800, margin: 1400 },
  { date: new Date(2025, 10, 1), production: 6100, cost: 4200, margin: 1900 },
  { date: new Date(2025, 11, 1), production: 4300, cost: 4600, margin: -300 },
  { date: new Date(2026, 0, 1), production: 6800, cost: 4500, margin: 2300 },
  { date: new Date(2026, 1, 1), production: 7600, cost: 5000, margin: 2600 },
  { date: new Date(2026, 2, 1), production: 4700, cost: 5500, margin: -800 },
  { date: new Date(2026, 3, 1), production: 9600, cost: 6200, margin: 3400 },
  { date: new Date(2026, 4, 1), production: 10800, cost: 7100, margin: 3700 },
  { date: new Date(2026, 5, 1), production: 12500, cost: 8200, margin: 4300 },
  { date: new Date(2026, 6, 1), production: 11200, cost: 7800, margin: 3400 },
  { date: new Date(2026, 7, 1), production: 9800, cost: 6900, margin: 2900 },
  { date: new Date(2026, 8, 1), production: 8400, cost: 6100, margin: 2300 },
]

// Acumulados de campaña completa
const totalProductionKg = rawData.reduce((acc, d) => acc + d.production, 0)
const totalCostEur = rawData.reduce((acc, d) => acc + d.cost, 0)
const totalMarginEur = rawData.reduce((acc, d) => acc + d.margin, 0)

const totalMarginTone =
  totalMarginEur >= 0
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400"

const cropSeasonPredictions = [
  {
    label: "Produccion estimada",
    value: `${totalProductionKg.toLocaleString("es-ES")} kg`,
    tone: "text-foreground",
  },
  {
    label: "Coste estimado",
    value: `${totalCostEur.toLocaleString("es-ES")} EUR`,
    tone: "text-red-600 dark:text-red-400",
  },
  {
    label: "Margen esperado",
    value: `${totalMarginEur > 0 ? "+" : ""}${totalMarginEur.toLocaleString("es-ES")} EUR`,
    tone: totalMarginTone,
  },
] as const

// Barras: margen negativo en rojo, positivo en verde
const chartData = rawData.map((d) => ({
  date: d.date,
  cost: d.cost,
  marginPositive: d.margin > 0 ? d.margin : 0,
  marginNegative: d.margin < 0 ? Math.abs(d.margin) : 0,
  marginLine: d.margin,
}))

interface CropSeasonPredictionsCardProps {
  className?: string
}

export function CropSeasonPredictionsCard({
  className,
}: CropSeasonPredictionsCardProps) {
  const lastPoint = rawData[rawData.length - 1]
  const prevPoint = rawData[rawData.length - 2]
  const trendDelta =
    lastPoint && prevPoint ? lastPoint.production - prevPoint.production : 0
  const trendIsUp = trendDelta >= 0
  const trendPercent =
    prevPoint && prevPoint.production > 0
      ? Math.round((Math.abs(trendDelta) / prevPoint.production) * 100)
      : null

  return (
    <Card
      className={cn(
        "flex h-full w-full flex-col bg-background ring-0",
        className
      )}
    >
      <CardHeader className="space-y-1 pb-0">
        <CardTitle className="text-sm font-medium">
          Prediccion de campaña
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Oct 2025 – Sep 2026
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="grid gap-2">
          {cropSeasonPredictions.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn("text-sm font-semibold", item.tone)}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <ComposedChart
          data={chartData}
          xDataKey="date"
          aspectRatio="auto"
          className="h-[160px]"
          margin={{ top: 8, right: 8, bottom: 24, left: 8 }}
          maxBarSize={30}
          stacked
          stackGap={3}
        >
          <Grid horizontal fadeHorizontal={false} />

          {/* Barra inferior: cost */}
          <SeriesBar
            dataKey="cost"
            fill="var(--primary-expense, #ef4444)"
            radius={0}
          />

          {/* Barra superior: margen positivo (verde) */}
          <SeriesBar
            dataKey="marginPositive"
            fill="var(--primary-income, #10b981)"
            radius={0}
          />

          {/* Barra superior: margen negativo (rojo) */}
          <SeriesBar
            dataKey="marginNegative"
            fill="var(--primary-expense, #ef4444)"
            radius={0}
          />

          {/* Línea del margen — color neutro para distinguirla de las barras */}
          <Line
            dataKey="marginLine"
            curve={curveCatmullRom.alpha(0.42)}
            strokeWidth={2}
            stroke="var(--foreground)"
            fadeEdges={false}
          />

          <ChartTooltip
            showCrosshair={false}
            content={({ point }) => (
              <TooltipContent
                rows={[
                  {
                    color: "var(--primary-expense)",
                    label: "Coste",
                    value: `${(point.cost as number).toLocaleString("es-ES")} €`,
                  },
                  {
                    color:
                      (point.marginLine as number) >= 0
                        ? "var(--primary-income)"
                        : "var(--primary-expense)",
                    label: "Margen",
                    value: `${(point.marginLine as number).toLocaleString("es-ES")} €`,
                  },
                ]}
              />
            )}
          />
          <XAxis numTicks={6} />
        </ComposedChart>
        <span
          className={cn(
            "text-xs font-medium underline decoration-dashed underline-offset-2 [text-decoration-skip-ink:none]",
            trendIsUp ? "text-(--primary-income)" : "text-(--primary-expense)"
          )}
        >
          {trendIsUp ? (
            <span>
              Produccion al alza <TrendingUp className="inline h-3 w-3" />{" "}
              {trendPercent}%
            </span>
          ) : (
            <span>
              Produccion a la baja <TrendingDown className="inline h-3 w-3" />{" "}
              {trendPercent}%
            </span>
          )}{" "}
          <span className="text-muted-foreground">vs mes anterior</span>
        </span>
      </CardContent>
    </Card>
  )
}
