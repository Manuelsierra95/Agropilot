"use client"

import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import { Sparkles } from "lucide-react"

import { ClampedTooltip } from "@workspace/web/components/clamped-tooltip"
import {
  buildFinanceInsights,
  financeInsightPriorityConfig,
  type FinanceInsight,
} from "@workspace/web/lib/finance/build-finance-insights"
import type { FinanceTransactionSnapshot } from "@workspace/web/lib/finance/types"
import type { Item as KpiItem } from "@workspace/web/features/dashboard/components/olive-price"

type FinanceInsightsListProps = {
  transactions: FinanceTransactionSnapshot[]
  oils: KpiItem[]
  className?: string
  insights?: FinanceInsight[]
}

function InsightRow({ insight }: { insight: FinanceInsight }) {
  const cfg = financeInsightPriorityConfig[insight.priority]

  return (
    <div className="flex w-full items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
      <div className={cn("mt-0.5 shrink-0", cfg.iconClass)}>{insight.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="truncate text-xs leading-snug font-semibold text-foreground">
            {insight.title}
          </span>
          <Badge
            variant={cfg.variant}
            className="h-4 px-1.5 text-[10px] font-medium tracking-wide uppercase"
          >
            {cfg.label}
          </Badge>
        </div>
        <ClampedTooltip text={insight.description} lines={2} />
      </div>
    </div>
  )
}

export function FinanceInsightsList({
  transactions,
  oils,
  className,
  insights: insightsProp,
}: FinanceInsightsListProps) {
  const insights =
    insightsProp ?? buildFinanceInsights(transactions, oils)
  const isEmpty = insights.length === 0

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex shrink-0 items-center gap-1.5 px-4 py-2">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Insights IA</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center px-4 py-6 text-center text-xs text-muted-foreground">
          Sin insights disponibles con los datos actuales.
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1 max-h-[220px]">
          <div className="divide-y divide-border/70">
            {insights.map((insight) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
