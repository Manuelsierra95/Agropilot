"use client"

import {
  ArrowRight,
} from "lucide-react"

import type { FinanceTransactionSnapshot } from "@workspace/web/lib/finance/types"
import type { Item as KpiItem } from "@workspace/web/features/dashboard/components/olive-price"
import { Gauge } from "@workspace/ui/components/charts"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import { ClampedTooltip } from "@workspace/web/components/clamped-tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { PreservedLink } from "@workspace/web/components/preserved-link"
import { SCOPE_KEYS } from "@workspace/web/lib/navigation/scope"
import { Separator } from "@workspace/ui/components/separator"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  buildFinanceInsights,
  financeInsightPriorityConfig,
} from "@workspace/web/lib/finance/build-finance-insights"

type TransactionSnapshot = FinanceTransactionSnapshot

interface FinanceRecommendationsCardProps {
  transactions: TransactionSnapshot[]
  oils: KpiItem[]
  redirectButton?: boolean
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinanceRecommendationsCard({
  transactions,
  oils,
  redirectButton = true,
  className,
}: FinanceRecommendationsCardProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((a, t) => a + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "gasto")
    .reduce((a, t) => a + t.amount, 0)
  const recs = buildFinanceInsights(transactions, oils).slice(0, 3)
  const isEmpty = transactions.length === 0

  const balance = totalIncome - totalExpenses
  const isPositive = balance >= 0

  // Gauge fill = income share of total cashflow (0–100).
  // 50 → break-even, >50 → profitable, <50 → spending more than earning.
  const total = totalIncome + totalExpenses
  const gaugeValue = total > 0 ? Math.round((totalIncome / total) * 100) : 50

  // Gradient swaps to red tones when balance is negative
  const activeGradient: [string, string] = isPositive
    ? ["#22c55e", "#16a34a"] // green range
    : ["#ef4444", "#dc2626"] // red range

  const inactiveGradient: [string, string] = isPositive
    ? ["#166534", "#14532d"] // dark green track
    : ["#7f1d1d", "#450a0a"] // dark red track

  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col gap-0 overflow-hidden bg-background pt-0 ring-0",
        className
      )}
    >
      <CardHeader className="flex shrink-0 flex-col items-center gap-0 pb-4">
        {/* ── Gauge ── */}
        <div className="mx-auto flex w-full max-w-[240px] justify-center">
          <Gauge
            value={gaugeValue}
            centerValue={balance}
            useGradient
            activeGradient={activeGradient}
            inactiveGradient={inactiveGradient}
            spacing={0}
            notchCornerRadius={7}
            startAngle={140}
            endAngle={400}
            inactiveFillOpacity={isEmpty ? 0.2 : 0.4}
            defaultLabel={isEmpty ? "Sin datos" : "Balance"}
            formatOptions={{
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }}
          />
        </div>

        {/* ── Leyenda ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-(--primary-income)" />
            <span className="text-xs text-muted-foreground">Ingresos</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {totalIncome.toLocaleString("es-ES")}
              {"\u00A0"}€
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-(--primary-expense)" />
            <span className="text-xs text-muted-foreground">Gastos</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {totalExpenses.toLocaleString("es-ES")}
              {"\u00A0"}€
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col items-center gap-0 overflow-hidden p-0">
        <Separator className="w-full bg-border/70" />
        {isEmpty ? (
          <div className="flex w-full flex-1 items-center justify-center px-4 py-6 text-center text-xs text-muted-foreground">
            Sin datos de transacciones
          </div>
        ) : (
          recs.map((rec) => {
            const cfg = financeInsightPriorityConfig[rec.priority]
            return (
              <div
                key={rec.id}
                className="flex w-full items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className={cn("mt-0.5 shrink-0", cfg.iconClass)}>
                  {rec.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="truncate text-xs leading-snug font-semibold text-foreground">
                      {rec.title}
                    </span>
                    <Badge
                      variant={cfg.variant}
                      className="h-4 px-1.5 text-[10px] font-medium tracking-wide uppercase"
                    >
                      {cfg.label}
                    </Badge>
                  </div>

                  <ClampedTooltip text={rec.description} lines={1} />
                </div>
              </div>
            )
          })
        )}
      </CardContent>

      {redirectButton && (
        <CardFooter className="flex items-center justify-center border-0 bg-background px-4 py-2">
          <PreservedLink
            href="/dashboard/finance"
            include={SCOPE_KEYS.parcel}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
            )}
          >
            <span>Ver recomendaciones detalladas</span>
            <ArrowRight className="size-3.5" />
          </PreservedLink>
        </CardFooter>
      )}
    </Card>
  )
}
