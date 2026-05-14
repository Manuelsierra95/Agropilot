"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { cn } from "@workspace/ui/lib/utils"

const cropSeasonPredictions = [
  {
    label: "Produccion estimada",
    value: "12.500 kg",
    tone: "text-foreground",
  },
  {
    label: "Coste estimado",
    value: "8.200 EUR",
    tone: "text-red-600 dark:text-red-400",
  },
  {
    label: "Margen esperado",
    value: "+4.300 EUR",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
] as const

const chartData = [
  { month: "Ene", production: 6800 },
  { month: "Feb", production: 7600 },
  { month: "Mar", production: 8400 },
  { month: "Abr", production: 9600 },
  { month: "May", production: 10800 },
  { month: "Jun", production: 12500 },
]

const chartConfig = {
  production: {
    label: "Produccion",
    color: "var(--primary-income)",
  },
} satisfies ChartConfig

interface CropSeasonPredictionsCardProps {
  className?: string
}

export function CropSeasonPredictionsCard({
  className,
}: CropSeasonPredictionsCardProps) {
  const lastPoint = chartData[chartData.length - 1]
  const prevPoint = chartData[chartData.length - 2]
  const trendDelta =
    lastPoint && prevPoint ? lastPoint.production - prevPoint.production : 0
  const trendIsUp = trendDelta >= 0
  const trendPercent =
    prevPoint && prevPoint.production > 0
      ? Math.round((Math.abs(trendDelta) / prevPoint.production) * 100)
      : null

  return (
    <Card className={cn("h-ful flex w-full flex-col", className)}>
      <CardHeader className="space-y-1 pb-0">
        <CardTitle className="text-sm font-medium">
          Prediccion de campaña
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Ene - Jun 2026
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <>
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {Number(value).toLocaleString("es-ES")} kg
                      </span>
                    </>
                  )}
                />
              }
            />
            <Line
              dataKey="production"
              type="linear"
              stroke="var(--color-production)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>

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
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/60 px-4 py-2">
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-medium",
            trendIsUp
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {trendIsUp ? "Produccion al alza" : "Produccion a la baja"}
          <span className="text-muted-foreground">
            {trendPercent === null ? "Sin base" : `${trendPercent}%`} vs mes
            anterior
          </span>
          {trendIsUp ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
        <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
          Act. {new Date().toLocaleDateString("es-ES")}
        </span>
      </CardFooter>
    </Card>
  )
}
