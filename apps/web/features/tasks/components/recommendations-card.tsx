import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Sparkles,
  Droplets,
  FlaskConical,
  SearchCheck,
  CalendarPlus,
  Plus,
  Loader2,
} from "lucide-react"

// ── types ────────────────────────────────────────────────────────────────────

export type RecommendationAction = "irrigate" | "treat" | "inspect" | "schedule"

export interface Recommendation {
  id: string
  parcelId: string
  parcelName: string
  title: string
  reason: string
  action: RecommendationAction
  when: string
  urgency: "now" | "soon" | "plan"
}

// ── helpers ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<RecommendationAction, { Icon: React.ElementType }> =
  {
    irrigate: { Icon: Droplets },
    treat: { Icon: FlaskConical },
    inspect: { Icon: SearchCheck },
    schedule: { Icon: CalendarPlus },
  }

const URGENCY_CONFIG: Record<
  Recommendation["urgency"],
  { label: string; badge: "destructive" | "secondary" | "outline" }
> = {
  now: { label: "Ahora", badge: "destructive" },
  soon: { label: "Pronto", badge: "secondary" },
  plan: { label: "Planificar", badge: "outline" },
}

// ── component ────────────────────────────────────────────────────────────────

interface RecommendationsCardProps {
  recommendations: Recommendation[]
  onAddToTasks?: (recommendation: Recommendation) => void
  addingRecommendationId?: string | null
}

export function RecommendationsCard({
  recommendations,
  onAddToTasks,
  addingRecommendationId,
}: RecommendationsCardProps) {
  const urgent = recommendations.filter((r) => r.urgency === "now").length

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden bg-background pt-0 ring-0">
      {/* Header */}
      <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium tracking-tight">
            Recomendaciones
          </span>
        </div>
        {urgent > 0 && (
          <Badge
            variant="destructive"
            className="h-5 rounded-sm px-1.5 text-[10px] font-medium tabular-nums"
          >
            {urgent} urgente{urgent !== 1 ? "s" : ""}
          </Badge>
        )}
      </CardHeader>

      {/* Body */}
      <CardContent className="min-h-0 flex-1 p-0">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Sparkles className="size-6 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Sin recomendaciones activas
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col divide-y divide-border">
              {recommendations.map((rec) => {
                const { Icon } = ACTION_CONFIG[rec.action]
                const urg = URGENCY_CONFIG[rec.urgency]
                const isPending = addingRecommendationId === rec.id

                return (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    {/* Icon */}
                    <div className="mt-px shrink-0 text-muted-foreground">
                      <Icon className="size-3.5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs leading-none font-medium">
                          {rec.title}
                        </p>
                        <Badge
                          variant={urg.badge}
                          className="ml-auto h-4 shrink-0 rounded-sm px-1 text-[10px] font-normal"
                        >
                          {urg.label}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                        {rec.reason}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                        {rec.when}
                        <span className="mx-1 opacity-50">·</span>
                        {rec.parcelName}
                      </p>
                    </div>

                    {/* Add to tasks */}
                    <Button
                      size="xs"
                      variant="outline"
                      className="mt-px shrink-0"
                      disabled={isPending}
                      onClick={() => onAddToTasks?.(rec)}
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
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
