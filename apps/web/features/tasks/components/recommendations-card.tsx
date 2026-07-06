"use client"

import { useMemo } from "react"
import { Sparkles } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import {
  RecommendationItem,
  URGENCY_SECTION_LABELS,
  URGENCY_SORT_ORDER,
} from "@workspace/web/features/tasks/components/recommendation-item"
import { RECOMMENDATIONS_PANEL_HEIGHT } from "@workspace/web/features/tasks/lib/constants"

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

// ── component ────────────────────────────────────────────────────────────────

interface RecommendationsCardProps {
  recommendations: Recommendation[]
  onAddToTasks?: (recommendation: Recommendation) => void
  onDismiss?: (recommendation: Recommendation) => void
  processingRecommendationId?: string | null
}

export function RecommendationsCard({
  recommendations,
  onAddToTasks,
  onDismiss,
  processingRecommendationId,
}: RecommendationsCardProps) {
  const count = recommendations.length
  const urgent = recommendations.filter((r) => r.urgency === "now").length

  const sortedRecommendations = useMemo(
    () =>
      [...recommendations].sort(
        (a, b) => URGENCY_SORT_ORDER[a.urgency] - URGENCY_SORT_ORDER[b.urgency]
      ),
    [recommendations]
  )

  const showSections = count > 3

  const groupedRecommendations = useMemo(() => {
    if (!showSections) {
      return [
        {
          urgency: null as Recommendation["urgency"] | null,
          items: sortedRecommendations,
        },
      ]
    }

    const groups: Array<{
      urgency: Recommendation["urgency"]
      items: Recommendation[]
    }> = []

    for (const rec of sortedRecommendations) {
      const last = groups[groups.length - 1]
      if (last?.urgency === rec.urgency) {
        last.items.push(rec)
      } else {
        groups.push({ urgency: rec.urgency, items: [rec] })
      }
    }

    return groups
  }, [showSections, sortedRecommendations])

  const subtitle =
    count === 0
      ? "Sin sugerencias"
      : urgent > 0
        ? `${urgent} requieren atención inmediata`
        : `${count} sugerencia${count !== 1 ? "s" : ""}`

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-0 overflow-hidden bg-background pt-0 ring-0",
        RECOMMENDATIONS_PANEL_HEIGHT
      )}
    >
      <CardHeader className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Recomendaciones
          </span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        {urgent > 0 && (
          <Badge
            variant="destructive"
            className="h-5 shrink-0 rounded-sm px-1.5 text-[10px] font-medium tabular-nums"
          >
            {urgent} urgente{urgent !== 1 ? "s" : ""}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {count === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <Sparkles className="size-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground">
                Sin recomendaciones activas
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Cuando haya alertas de riego, tratamiento o inspección,
                aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-3">
              {groupedRecommendations.map((group) => (
                <div key={group.urgency ?? "all"}>
                  {showSections && group.urgency && (
                    <p className="px-1 pt-1 pb-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      {URGENCY_SECTION_LABELS[group.urgency]}
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    {group.items.map((rec) => (
                      <RecommendationItem
                        key={rec.id}
                        recommendation={rec}
                        isPending={processingRecommendationId === rec.id}
                        onAddToTasks={onAddToTasks}
                        onDismiss={onDismiss}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="shrink-0 border-t border-border/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          Añade una sugerencia al tablero o descártala si no aplica.
        </span>
      </CardFooter>
    </Card>
  )
}
