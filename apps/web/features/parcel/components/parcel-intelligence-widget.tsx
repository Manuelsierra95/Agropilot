"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  MapPin,
  Thermometer,
  Droplets,
  TrendingUp,
  ListTodo,
  AlertCircle,
  Leaf,
  Scale,
} from "lucide-react"

export interface ParcelIntelligenceData {
  // Header info
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  stationId: string
  cropType: string
  area: number // hectáreas
  lastUpdate: Date

  // Temperature
  temperature: number
  temperatureChange: number // porcentaje
  phenologicalStage: string

  // Metrics
  gdd: number // Growing Degree Days
  kc: number // Coeficiente de cultivo
  waterBalance: number // porcentaje
  estimatedProfitability: number // euros
  participants: number // usuarios que participan en la parcela
  pendingTasks: number // tareas pendientes
  completedTasks: number // tareas completadas

  // Rendimiento (nuevo)
  totalTrees: number
  totalYieldKg: number
}

interface ParcelIntelligenceWidgetProps {
  data: ParcelIntelligenceData
  className?: string
}

function MetricItem({
  label,
  value,
  unit,
  icon: Icon,
  status,
}: {
  label: string
  value: string | number
  unit?: string
  icon?: React.ElementType
  status?: "positive" | "warning" | "critical" | "neutral"
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {status && (
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "positive" && "bg-water-positive",
              status === "warning" && "bg-water-warning",
              status === "critical" && "bg-water-critical",
              status === "neutral" && "bg-foreground/60"
            )}
          />
        )}
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {value}
          {unit && (
            <span className="ml-0.5 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </span>
      </div>
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="h-10 w-px bg-border" />
}

export function ParcelIntelligenceWidget({
  data,
  className,
}: ParcelIntelligenceWidgetProps) {
  const yieldPerTree =
    data.totalTrees > 0 ? (data.totalYieldKg / data.totalTrees).toFixed(2) : 0

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data.lastUpdate)

  const formattedProfitability = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    signDisplay: "always",
    maximumFractionDigits: 0,
  }).format(data.estimatedProfitability)

  return (
    <Card className={cn("w-full bg-background p-0 ring-0", className)}>
      {/* Header */}
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm tracking-[0.18em] text-muted-foreground uppercase">
            Inteligencia de Parcela
          </p>
          <h1 className="text-2xl leading-tight font-semibold md:text-3xl">
            {data.name}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Monitorización de la evolución térmica, precipitación, balance
            hídrico y riesgo agronómico en una vista única.
          </p>

          {/* Meta info row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {data.coordinates.lat.toFixed(4)},{" "}
              {data.coordinates.lng.toFixed(4)}
            </span>
            <span className="text-border">|</span>
            <span>Est. {data.stationId}</span>
            <span className="text-border">|</span>
            <span>{data.cropType}</span>
            <span className="text-border">|</span>
            <span>{data.area} ha</span>
            <span className="text-border">|</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Temperature & Stage */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {data.temperature.toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground">°C</span>
              <span
                className={cn(
                  "ml-1 text-xs font-medium",
                  data.temperatureChange >= 0 ? "text-income" : "text-expense"
                )}
              >
                {data.temperatureChange >= 0 ? "+" : ""}
                {data.temperatureChange.toFixed(1)}%
              </span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Temperatura
            </p>
          </div>

          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 font-medium">
            <Leaf className="size-3.5" />
            {data.phenologicalStage}
          </Badge>
        </div>
      </CardHeader>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Metrics Grid */}
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <MetricItem label="GDD" value={data.gdd} unit="°C·día" />

        <Divider />

        <MetricItem label="Coef. Cultivo" value={`Kc ${data.kc.toFixed(2)}`} />

        <Divider />

        <MetricItem
          label="Balance Hídrico"
          value={data.waterBalance}
          unit="%"
          status={
            data.waterBalance >= 80
              ? "positive"
              : data.waterBalance >= 50
                ? "warning"
                : "critical"
          }
        />

        <Divider />

        <MetricItem label="Rentabilidad Est." value={formattedProfitability} />

        <Divider />

        <MetricItem label="Rendimiento" value={yieldPerTree} unit="kg/oliva" />

        <Divider />

        <MetricItem label="Usuarios" value={data.participants} />

        <Divider />

        {/* Pending & Completed Tasks */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="bg-task-pending-text size-1.5 rounded-full" />
              <span className="text-lg font-semibold text-foreground">
                {data.pendingTasks}
              </span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1">
              <span className="bg-task-completed-text size-1.5 rounded-full" />
              <span className="text-lg font-semibold text-foreground">
                {data.completedTasks}
              </span>
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Tareas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
