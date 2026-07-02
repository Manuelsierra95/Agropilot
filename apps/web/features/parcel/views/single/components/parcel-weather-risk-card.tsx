"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import type { RiskRecommendation } from "@workspace/web/features/parcel/lib/parcel-types"
import {
  riskToBadgeClass,
  riskToLabel,
} from "@workspace/web/features/parcel/lib/parcel-utils"

type ParcelWeatherRiskCardProps = {
  label: string
  score: number
  level: "low" | "medium" | "high"
  reasons: string[]
  recommendation?: RiskRecommendation
}

function getRiskDotClass(level: "low" | "medium" | "high") {
  if (level === "high") return "bg-red-500"
  if (level === "medium") return "bg-amber-500"
  return "bg-emerald-500"
}

function getUrgencyBannerClass(urgency: "low" | "medium" | "high") {
  if (urgency === "high")
    return "border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400"
  if (urgency === "medium")
    return "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400"
  return "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
}

export function ParcelWeatherRiskCard({
  label,
  score,
  level,
  reasons,
  recommendation,
}: ParcelWeatherRiskCardProps) {
  return (
    <Card className="overflow-hidden bg-background ring-0">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="mt-1 text-lg">{riskToLabel(level)}</CardTitle>
          </div>
          <Badge className={riskToBadgeClass(level)} variant="outline">
            {Math.round(score * 100)}%
          </Badge>
        </div>

        <div className="h-2 rounded-full bg-muted/70">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700",
              getRiskDotClass(level)
            )}
            style={{ width: `${Math.max(0, Math.min(score, 1)) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2 text-xs text-muted-foreground">
          {reasons.slice(0, 2).map((reason) => (
            <div key={reason} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                  getRiskDotClass(level)
                )}
              />
              <p>{reason}</p>
            </div>
          ))}
        </div>

        {recommendation && (
          <>
            <div
              className={cn(
                "space-y-1 rounded-md border px-3 py-2 text-xs",
                getUrgencyBannerClass(recommendation.urgency)
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{recommendation.title}</p>
                {recommendation.window && (
                  <span className="shrink-0 opacity-70">
                    {recommendation.window}
                  </span>
                )}
              </div>
              <p className="opacity-80">{recommendation.description}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              {recommendation.actions.map((action) => (
                <Button
                  key={action.type}
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
                  onClick={() =>
                    console.log("action", action.type, action.payload)
                  }
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
