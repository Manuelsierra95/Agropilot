import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  Plus,
  ArrowRight,
  Droplets,
  Leaf,
  ShieldCheck,
  Wheat,
  Scissors,
  Search,
  TriangleAlert,
  Clock,
  Euro,
  TrendingUp,
  Settings,
  PencilLine,
} from "lucide-react"

// --- Types ---

export type FarmEventType =
  | "irrigation"
  | "fertilization"
  | "treatment"
  | "harvest"
  | "pruning"
  | "inspection"
  | "alert"

export type FarmEventStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped"
export type FarmEventPriority = "low" | "medium" | "high" | "critical"

export type FarmEvent = {
  id: string
  title: string
  description?: string
  type: FarmEventType
  category: string
  color: string
  startAt: string
  endAt?: string
  allDay?: boolean
  status: FarmEventStatus
  priority: FarmEventPriority
  parcelId: string
  crop?: string
  recommendation?: string
  reason?: string
  impact?: {
    cost?: number
    expectedYieldImpact?: number
    waterUse?: number
  }
  tags?: string[]
  source: "manual" | "system" | "integration"
  createdAt: string
  updatedAt: string
}

type FarmEventListProps = {
  events: FarmEvent[]
  title?: string
  onNewEvent?: () => void
  onViewAll?: () => void
}

// --- Config maps ---

const TYPE_ICON: Record<FarmEventType, React.ReactNode> = {
  irrigation: <Droplets className="size-4" />,
  fertilization: <Leaf className="size-4" />,
  treatment: <ShieldCheck className="size-4" />,
  harvest: <Wheat className="size-4" />,
  pruning: <Scissors className="size-4" />,
  inspection: <Search className="size-4" />,
  alert: <TriangleAlert className="size-4" />,
}

const STATUS_CFG: Record<
  FarmEventStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  pending: { label: "Pendiente", variant: "secondary" },
  in_progress: { label: "En curso", variant: "default" },
  completed: { label: "Completado", variant: "outline" },
  skipped: { label: "Omitido", variant: "outline" },
}

const PRIORITY_CLASS: Record<FarmEventPriority, string> = {
  low: "text-muted-foreground",
  medium: "text-amber-600",
  high: "text-rose-600",
  critical: "text-violet-600",
}

const PRIORITY_LABEL: Record<FarmEventPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
}

// --- Helpers ---

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateKey(iso: string) {
  return iso.slice(0, 10)
}

function formatDayLabel(dateKey: string, today: string) {
  const diff = Math.round(
    (new Date(dateKey + "T00:00:00").getTime() -
      new Date(today + "T00:00:00").getTime()) /
      86_400_000
  )
  if (diff === 0) return "Hoy"
  if (diff === 1) return "Mañana"
  return new Date(dateKey + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })
}

function formatShortDate(dateKey: string) {
  return new Date(dateKey + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })
}

function groupByDate(events: FarmEvent[]): [string, FarmEvent[]][] {
  const map = new Map<string, FarmEvent[]>()
  events.forEach((e) => {
    const key = formatDateKey(e.startAt)
    map.set(key, [...(map.get(key) ?? []), e])
  })
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

// --- EventCard ---

function EventCard({ event }: { event: FarmEvent }) {
  const startTime = formatTime(event.startAt)
  const endTime = event.endAt ? formatTime(event.endAt) : null
  const timeStr = endTime ? `${startTime} – ${endTime}` : startTime

  const today = new Date().toISOString().slice(0, 10)
  const eventDay = formatDateKey(event.startAt)
  const dayLabel = formatDayLabel(eventDay, today)

  const metrics: { icon: React.ReactNode; label: string }[] = [
    event.impact?.waterUse != null && {
      icon: <Droplets className="size-3" />,
      label: `${event.impact.waterUse.toLocaleString("es-ES")} L`,
    },
    event.impact?.cost != null && {
      icon: <Euro className="size-3" />,
      label: `${event.impact.cost}`,
    },
    event.impact?.expectedYieldImpact != null && {
      icon: <TrendingUp className="size-3" />,
      label: `+${event.impact.expectedYieldImpact}%`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[]

  return (
    <li className="flex items-stretch gap-3 border-b py-3 last:border-0">
      {/* Color accent */}
      <div
        className="w-[2px] flex-none rounded-full"
        style={{ background: event.color }}
      />

      <div className="min-w-0 grow space-y-1">
        {/* Priority + title */}
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">
            <span
              className={`mr-1.5 text-xs font-semibold ${PRIORITY_CLASS[event.priority]}`}
            >
              [{PRIORITY_LABEL[event.priority].toUpperCase()}]
            </span>
            {event.title}
          </p>
          <Badge
            variant="secondary"
            className="flex-none text-[11px] font-normal"
          >
            {STATUS_CFG[event.status].label}
          </Badge>
        </div>

        {/* Time */}
        <p className="text-xs text-muted-foreground">
          {dayLabel} · {timeStr}
        </p>

        {/* Crop + parcel */}
        {(event.crop || event.parcelId) && (
          <p className="text-xs text-muted-foreground">
            {[event.crop, event.parcelId].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* Reason + recommendation */}
        {(event.reason || event.recommendation) && (
          <div className="space-y-0.5 pt-0.5">
            {event.reason && (
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground/60">Motivo:</span>{" "}
                {event.reason}
              </p>
            )}
            {event.recommendation && (
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground/60">Recomendación:</span>{" "}
                {event.recommendation}
              </p>
            )}
          </div>
        )}

        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {metrics.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {m.icon}
                {m.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}

// --- Main component ---

export function FarmEventList({ events }: FarmEventListProps) {
  const today = new Date().toISOString().slice(0, 10)
  const groups = groupByDate(events)

  return (
    <div className="space-y-4">
      {groups.map(([dateKey, groupEvents]) => (
        <div key={dateKey}>
          <p className="mb-1 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {formatDayLabel(dateKey, today)}
          </p>
          <ul>
            {groupEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
