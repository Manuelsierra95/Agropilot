"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"
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
import type { ParcelApiResponse } from "@/features/parcel/components/parcel-types"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

type DashboardRiskRadarProps = {
  apiResponse?: Pick<ParcelApiResponse, "risks">
  className?: string
}

const chartConfig = {
  score: {
    label: "Riesgo",
    color: "var(--risk-chart-primary)",
  },
} satisfies ChartConfig

export function DashboardRiskRadar({
  apiResponse,
  className,
}: DashboardRiskRadarProps) {
  const chartData = apiResponse
    ? [
        {
          risk: "Hídrico",
          score: Math.round(
            Math.max(0, Math.min(apiResponse.risks.waterStress.score, 1)) * 100
          ),
        },
        {
          risk: "Fúngico",
          score: Math.round(
            Math.max(0, Math.min(apiResponse.risks.fungalRisk.score, 1)) * 100
          ),
        },
        {
          risk: "Insectos",
          score: Math.round(
            Math.max(0, Math.min(apiResponse.risks.insectRisk.score, 1)) * 100
          ),
        },
        {
          risk: "Térmico",
          score: Math.round(
            Math.max(0, Math.min(apiResponse.risks.thermalStress.score, 1)) *
              100
          ),
        },
      ]
    : [
        { risk: "Hídrico", score: 0 },
        { risk: "Fúngico", score: 0 },
        { risk: "Insectos", score: 0 },
        { risk: "Térmico", score: 0 },
      ]

  const riskScore = apiResponse
    ? Math.round(
        ((apiResponse.risks.waterStress.score +
          apiResponse.risks.fungalRisk.score +
          apiResponse.risks.insectRisk.score +
          apiResponse.risks.thermalStress.score) /
          4) *
          100
      )
    : null

  return (
    <Card className={cn("flex h-full w-full pb-0", className)}>
      <CardHeader className="items-center">
        <CardTitle>Mapa de Riesgos</CardTitle>
        <CardDescription>
          Puntuación por categoría de riesgo (0–100)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col items-center justify-center gap-2 md:gap-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px] w-full"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid
              className="fill-(--color-score) opacity-10"
              gridType="circle"
            />
            <PolarAngleAxis dataKey="risk" tickSize={15} />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={6} // area size -> 0, 20, 40, 60, 80, 100
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ChartContainer>
        <section className="flex flex-col items-center gap-2 leading-none font-medium">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-(--risk-chart-primary) shadow-[0_0_5px_var(--risk-chart-primary)]" />
            <span>
              Riesgo actual:{" "}
              <span className="text-foreground">{riskScore}%</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>El riesgo ha subido un 5.2% este mes</span>
            <TrendingUp className="h-4 w-4 text-(--risk-chart-high)" />
          </div>
        </section>
      </CardContent>
      <CardFooter className="flex items-center justify-center border-t border-border/60 px-4 py-2">
        <Link
          href="/dashboard/finance"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Ver análisis completo</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}
