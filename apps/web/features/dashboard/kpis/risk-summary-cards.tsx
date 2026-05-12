"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Badge } from "@workspace/ui/components/badge"
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
import { cn } from "@workspace/ui/lib/utils"

import type {
  ParcelApiResponse,
  WeatherRiskLevel,
} from "@/features/parcel/components/parcel-types"
import {
  riskToBadgeClass,
  riskToLabel,
} from "@/features/parcel/components/parcel-utils"

type DashboardRiskSummaryProps = {
  apiResponse?: Pick<ParcelApiResponse, "risks">
  className?: string
}

function getRiskDotClass(level: WeatherRiskLevel) {
  if (level === "high") return "bg-red-500"
  if (level === "medium") return "bg-amber-500"
  return "bg-emerald-500"
}

function getRiskColor(level: WeatherRiskLevel) {
  if (level === "high") return "var(--color-high)"
  if (level === "medium") return "var(--color-medium)"
  return "var(--color-low)"
}

function getRiskHex(level: WeatherRiskLevel) {
  if (level === "high") return "#e24b4a"
  if (level === "medium") return "#ef9f27"
  return "#639922"
}

function getGlobalLevel(score: number): WeatherRiskLevel {
  if (score >= 60) return "high"
  if (score >= 35) return "medium"
  return "low"
}

function getGlobalLevelLabel(level: WeatherRiskLevel) {
  if (level === "high") return "Alto"
  if (level === "medium") return "Medio"
  return "Bajo"
}

const chartConfig = {
  score: { label: "Puntuación" },
  high: { label: "Alto", color: "#e24b4a" },
  medium: { label: "Medio", color: "#ef9f27" },
  low: { label: "Bajo", color: "#639922" },
  track: { label: "Restante", color: "#88878020" },
} satisfies ChartConfig

type RiskRowProps = {
  label: string
  score: number
  level: WeatherRiskLevel
  reasons: string[]
}

function RiskRow({ label, score, level, reasons }: RiskRowProps) {
  const clampedScore = Math.max(0, Math.min(score, 1))
  const reason = reasons[0] ?? "Sin detalles disponibles."

  return (
    <div className="grid gap-1.5 py-2 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                getRiskDotClass(level)
              )}
            />
            <p className="text-[12px] leading-none font-semibold text-foreground">
              {riskToLabel(level)}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "h-4 px-1 text-[9px] font-medium",
            riskToBadgeClass(level)
          )}
          variant="outline"
        >
          {Math.round(clampedScore * 100)}%
        </Badge>
      </div>

      <div className="h-0.5 rounded-full bg-muted/70">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700",
            getRiskDotClass(level)
          )}
          style={{ width: `${clampedScore * 100}%` }}
        />
      </div>

      <p className="text-[9px] leading-snug text-muted-foreground">{reason}</p>
    </div>
  )
}

export function DashboardRiskSummary({
  apiResponse,
  className,
}: DashboardRiskSummaryProps) {
  const riskCards = apiResponse
    ? [
        {
          label: "Riesgo hídrico",
          score: apiResponse.risks.waterStress.score,
          level: apiResponse.risks.waterStress.level,
          reasons: apiResponse.risks.waterStress.reasons,
        },
        {
          label: "Riesgo fúngico",
          score: apiResponse.risks.fungalRisk.score,
          level: apiResponse.risks.fungalRisk.level,
          reasons: apiResponse.risks.fungalRisk.reasons,
        },
        {
          label: "Riesgo insectos",
          score: apiResponse.risks.insectRisk.score,
          level: apiResponse.risks.insectRisk.level,
          reasons: apiResponse.risks.insectRisk.reasons,
        },
        {
          label: "Estrés térmico",
          score: apiResponse.risks.thermalStress.score,
          level: apiResponse.risks.thermalStress.level,
          reasons: apiResponse.risks.thermalStress.reasons,
        },
      ]
    : [
        {
          label: "Riesgo hídrico",
          score: 0,
          level: "low" as const,
          reasons: ["No hay respuesta de API disponible."],
        },
        {
          label: "Riesgo fúngico",
          score: 0,
          level: "low" as const,
          reasons: ["Esperando respuesta de la API."],
        },
        {
          label: "Riesgo insectos",
          score: 0,
          level: "low" as const,
          reasons: ["Esperando respuesta de la API."],
        },
        {
          label: "Estrés térmico",
          score: 0,
          level: "low" as const,
          reasons: ["Esperando respuesta de la API."],
        },
      ]

  const avgScore = React.useMemo(
    () =>
      Math.round(
        (riskCards.reduce(
          (sum, r) => sum + Math.max(0, Math.min(r.score, 1)),
          0
        ) /
          riskCards.length) *
          100
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiResponse]
  )

  const globalLevel = getGlobalLevel(avgScore)

  const chartData = [
    {
      name: "score",
      value: avgScore,
      fill: getRiskHex(globalLevel),
    },
    {
      name: "track",
      value: 100 - avgScore,
      fill: "var(--color-track)",
    },
  ]

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/25",
        className
      )}
    >
      <CardHeader className="px-4 pb-4">
        <CardTitle className="text-sm font-medium">Riesgo global</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Evaluación combinada de riesgos climáticos para la parcela.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-3 pb-0"></CardContent>
    </Card>
  )
}
