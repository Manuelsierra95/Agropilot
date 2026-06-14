"use client"

import { cn } from "@workspace/ui/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { LinkButton } from "@/components/ui/link-button"

type RecommendationItem = {
  parcelId: string
  parcelName: string
  type: string
  priority: "low" | "medium" | "high"
  message: string
  details: string
}

const priorityConfig = {
  high: {
    label: "Alta",
    dotClass: "bg-red-500",
    badgeClass: "border-red-500/40 bg-red-500/10 text-red-700",
  },
  medium: {
    label: "Media",
    dotClass: "bg-amber-500",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  },
  low: {
    label: "Baja",
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  },
} as const

type RecommendationsAllProps = {
  className?: string
  items: RecommendationItem[]
}

export function RecommendationsAll({
  className,
  items,
}: RecommendationsAllProps) {
  const visibleItems = items.slice(0, 4)
  return (
    <Card
      className={cn(
        "flex flex-col gap-0 bg-background shadow-none ring-0",
        className
      )}
    >
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-2 text-base">
          Recomendaciones
          <Badge variant="secondary" className="h-5 w-5 rounded-full text-xs">
            {items.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Acciones sugeridas en todas las parcelas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-3 py-3">
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <p className="text-xs text-muted-foreground">
              Sin recomendaciones activas.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border/30 pr-3">
            {visibleItems.map((rec) => {
              const config = priorityConfig[rec.priority]
              return (
                <li
                  key={`${rec.parcelId}-${rec.type}-${rec.message}`}
                  className="flex items-start justify-between gap-3 px-2 py-2"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={cn("h-2 w-2 rounded-full", config.dotClass)}
                      />
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {rec.parcelName}
                      </Badge>
                      <p className="text-xs font-medium text-foreground">
                        {rec.message}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">
                      {rec.details}
                    </p>
                  </div>
                  <Badge
                    className={cn("shrink-0", config.badgeClass)}
                    variant="outline"
                  >
                    {config.label}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
      <LinkButton text="Ver detalle" href="/dashboard/parcel" />
    </Card>
  )
}
