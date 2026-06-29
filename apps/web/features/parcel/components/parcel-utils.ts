import { cn } from "@workspace/ui/lib/utils"

import type { WeatherRiskLevel } from "@workspace/web/features/parcel/components/parcel-types"

export function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits,
  }).format(value)
}

export function riskToLabel(risk: WeatherRiskLevel) {
  if (risk === "high") return "Alto"
  if (risk === "medium") return "Medio"
  return "Bajo"
}

export function riskToBadgeClass(risk: WeatherRiskLevel) {
  return cn(
    "font-medium",
    risk === "high" && "border-red-500/40 bg-red-500/10 text-red-700",
    risk === "medium" && "border-amber-500/40 bg-amber-500/10 text-amber-700",
    risk === "low" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
  )
}

export function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  })
}

export function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
