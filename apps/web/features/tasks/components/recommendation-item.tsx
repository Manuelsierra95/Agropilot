import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ClampedTooltip } from "@workspace/web/components/clamped-tooltip"
import type { Recommendation } from "@workspace/web/features/tasks/components/recommendations-card"
import {
  CalendarPlus,
  Droplets,
  FlaskConical,
  Loader2,
  Plus,
  SearchCheck,
} from "lucide-react"

type RecommendationAction = Recommendation["action"]

const ACTION_CONFIG: Record<
  RecommendationAction,
  { Icon: React.ElementType; chipClass: string }
> = {
  irrigate: {
    Icon: Droplets,
    chipClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  treat: {
    Icon: FlaskConical,
    chipClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  inspect: {
    Icon: SearchCheck,
    chipClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  schedule: {
    Icon: CalendarPlus,
    chipClass: "bg-muted text-muted-foreground",
  },
}

const URGENCY_CONFIG: Record<
  Recommendation["urgency"],
  {
    label: string
    badge: "destructive" | "secondary" | "outline"
    badgeClass?: string
    borderClass: string
  }
> = {
  now: {
    label: "Ahora",
    badge: "destructive",
    borderClass: "border-l-red-500",
  },
  soon: {
    label: "Pronto",
    badge: "outline",
    badgeClass:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    borderClass: "border-l-amber-500",
  },
  plan: {
    label: "Planificar",
    badge: "outline",
    borderClass: "border-l-border",
  },
}

type RecommendationItemProps = {
  recommendation: Recommendation
  isPending: boolean
  onAddToTasks?: (recommendation: Recommendation) => void
  onDismiss?: (recommendation: Recommendation) => void
}

export function RecommendationItem({
  recommendation,
  isPending,
  onAddToTasks,
  onDismiss,
}: RecommendationItemProps) {
  const { Icon, chipClass } = ACTION_CONFIG[recommendation.action]
  const urg = URGENCY_CONFIG[recommendation.urgency]

  return (
    <div
      className={cn(
        "group rounded-md border border-border/40 border-l-[3px] bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50",
        urg.borderClass
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
            chipClass
          )}
        >
          <Icon className="size-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="text-xs leading-snug font-medium text-foreground">
              {recommendation.title}
            </p>
            <Badge
              variant={urg.badge}
              className={cn(
                "ml-auto h-4 shrink-0 rounded-sm px-1.5 text-[10px] font-medium",
                urg.badgeClass
              )}
            >
              {urg.label}
            </Badge>
          </div>

          <div className="mt-1">
            <ClampedTooltip text={recommendation.reason} lines={2} />
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {recommendation.when}
            <span className="mx-1 opacity-50">·</span>
            {recommendation.parcelName}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-2 flex justify-end gap-1 transition-opacity",
          "opacity-100 [@media(hover:hover)]:opacity-0",
          "[@media(hover:hover)]:group-hover:opacity-100",
          "[@media(hover:hover)]:group-focus-within:opacity-100"
        )}
      >
        <Button
          size="xs"
          variant="ghost"
          className="text-muted-foreground"
          disabled={isPending}
          onClick={() => onDismiss?.(recommendation)}
        >
          Descartar
        </Button>
        <Button
          size="xs"
          variant="outline"
          disabled={isPending}
          onClick={() => onAddToTasks?.(recommendation)}
        >
          {isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Añadiendo
            </>
          ) : (
            <>
              <Plus className="size-3" />
              Añadir
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export const URGENCY_SECTION_LABELS: Record<Recommendation["urgency"], string> =
  {
    now: "Ahora",
    soon: "Pronto",
    plan: "Planificar",
  }

export const URGENCY_SORT_ORDER: Record<Recommendation["urgency"], number> = {
  now: 0,
  soon: 1,
  plan: 2,
}
