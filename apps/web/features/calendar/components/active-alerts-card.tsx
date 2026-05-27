import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Wind,
  Thermometer,
  CloudRain,
  Bug,
  TriangleAlert,
  ShieldAlert,
} from "lucide-react"

// ── types ────────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info"

export interface ActiveAlert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  parcelName: string
  type: "wind" | "heat" | "rain" | "pest" | "disease" | "general"
  since: string
  until?: string
}

// ── mock data ────────────────────────────────────────────────────────────────

export const mockAlerts: ActiveAlert[] = [
  {
    id: "alert-1",
    title: "Viento fuerte",
    description: "Rachas superiores a 40 km/h. Evitar tratamientos foliares.",
    severity: "critical",
    parcelName: "Olivar La Loma",
    type: "wind",
    since: "2026-04-07T00:00:00",
    until: "2026-04-07T23:59:00",
  },
  {
    id: "alert-2",
    title: "Riesgo mosca del olivo",
    description:
      "Presencia detectada en trampas. Revisar antes del tratamiento.",
    severity: "warning",
    parcelName: "Finca El Cerro",
    type: "pest",
    since: "2026-04-05T08:00:00",
  },
  {
    id: "alert-3",
    title: "Temperatura elevada",
    description: "Máximas >32 °C previstas. Adelantar riegos a primera hora.",
    severity: "warning",
    parcelName: "Todas las parcelas",
    type: "heat",
    since: "2026-04-12T06:00:00",
    until: "2026-04-14T20:00:00",
  },
  {
    id: "alert-4",
    title: "Lluvia prevista",
    description: "10–15 mm en las próximas 48 h. Posponer fertilización.",
    severity: "info",
    parcelName: "Todas las parcelas",
    type: "rain",
    since: "2026-04-15T00:00:00",
  },
]

// ── helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    label: string
    dot: string
    row: string
    badge: "destructive" | "secondary" | "outline"
  }
> = {
  critical: {
    label: "Crítica",
    dot: "bg-foreground",
    row: "border-l-2 border-l-destructive",
    badge: "destructive",
  },
  warning: {
    label: "Aviso",
    dot: "bg-muted-foreground",
    row: "border-l-2 border-l-muted-foreground",
    badge: "secondary",
  },
  info: {
    label: "Info",
    dot: "bg-border",
    row: "border-l-2 border-l-border",
    badge: "outline",
  },
}

const TYPE_ICON: Record<ActiveAlert["type"], React.ElementType> = {
  wind: Wind,
  heat: Thermometer,
  rain: CloudRain,
  pest: Bug,
  disease: ShieldAlert,
  general: TriangleAlert,
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "< 1 h"
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

// ── component ────────────────────────────────────────────────────────────────

interface ActiveAlertsCardProps {
  alerts?: ActiveAlert[]
}

export function ActiveAlertsCard({
  alerts = mockAlerts,
}: ActiveAlertsCardProps) {
  const critical = alerts.filter((a) => a.severity === "critical").length

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden bg-background ring-0">
      {/* Header */}
      <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium tracking-tight">
            Alertas activas
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {critical > 0 && (
            <Badge
              variant="destructive"
              className="h-5 rounded-sm px-1.5 text-[10px] font-medium tabular-nums"
            >
              {critical} crítica{critical !== 1 ? "s" : ""}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="h-5 rounded-sm px-1.5 text-[10px] text-muted-foreground tabular-nums"
          >
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="min-h-0 flex-1 p-0">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <ShieldAlert className="size-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Sin alertas activas</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col divide-y divide-border">
              {alerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity]
                const Icon = TYPE_ICON[alert.type]

                return (
                  <div
                    key={alert.id}
                    className={`flex cursor-default items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40`}
                  >
                    {/* Icon */}
                    <div className="mt-px shrink-0 text-muted-foreground">
                      <Icon className="size-3.5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs leading-none font-medium">
                          {alert.title}
                        </p>
                        <Badge
                          variant={cfg.badge}
                          className="ml-auto h-4 shrink-0 rounded-sm px-1 text-[10px] font-normal"
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/70">
                        {alert.description}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                        {alert.parcelName}
                        <span className="mx-1 opacity-40">·</span>
                        hace {relativeDate(alert.since)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
