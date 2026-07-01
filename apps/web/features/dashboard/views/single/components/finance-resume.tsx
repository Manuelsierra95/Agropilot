"use client"

import * as React from "react"

import type { FinanceTransactionSnapshot } from "@workspace/web/lib/finance/types"
import type { Item } from "@workspace/web/features/dashboard/components/olive-price"
import { Gauge } from "@workspace/ui/components/charts"
import { Card, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { LinkButton } from "@workspace/web/components/ui/link-button"
import { SCOPE_KEYS } from "@workspace/web/lib/navigation/scope"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionSnapshot = FinanceTransactionSnapshot

interface FinanceRecommendationsProps {
  transactions: TransactionSnapshot[]
  oils: Item[]
  previousCampaign?: {
    totalIncome: number
    totalExpenses: number
  }
  redirectButton?: boolean
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinanceResume({
  className,
  transactions,
  previousCampaign,
}: FinanceRecommendationsProps) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "gasto")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const totalExpenses = Object.values(expensesByCategory).reduce(
    (a, b) => a + b,
    0
  )
  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((a, t) => a + t.amount, 0)

  const balance = totalIncome - totalExpenses
  const isPositive = balance >= 0

  const prevBalance = previousCampaign
    ? previousCampaign.totalIncome - previousCampaign.totalExpenses
    : null
  const balanceVsPrev =
    prevBalance && prevBalance !== 0
      ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100
      : null

  // Gauge fill = income share of total cashflow (0–100).
  // 50 → break-even, >50 → profitable, <50 → spending more than earning.
  const total = totalIncome + totalExpenses
  const gaugeValue = total > 0 ? Math.round((totalIncome / total) * 100) : 50

  // Gradient swaps to red tones when balance is negative
  const activeGradient: [string, string] = isPositive
    ? [
        "color-mix(in oklch, var(--primary-income) 60%, transparent)",
        "var(--primary-income)",
      ]
    : [
        "color-mix(in oklch, var(--primary-expense) 60%, transparent)",
        "var(--primary-expense)",
      ]

  const inactiveGradient: [string, string] = isPositive
    ? [
        "color-mix(in oklch, var(--primary-income) 25%, transparent)",
        "color-mix(in oklch, var(--primary-income) 45%, transparent)",
      ]
    : [
        "color-mix(in oklch, var(--primary-expense) 25%, transparent)",
        "color-mix(in oklch, var(--primary-expense) 45%, transparent)",
      ]

  return (
    <Card
      className={cn(
        "flex h-full w-full max-w-xs min-w-0 flex-col gap-0 overflow-hidden bg-background pt-0 ring-0",
        className
      )}
    >
      <CardHeader className="flex flex-col items-center">
        {/* ── Gauge ── */}
        <div className="mx-auto flex h-full w-full max-w-xs justify-center">
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
            inactiveFillOpacity={0.4}
            defaultLabel="Balance"
            formatOptions={{
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }}
          />
        </div>

        {/* ── Leyenda ── */}
        <div className="flex items-center justify-center gap-5">
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

        {balanceVsPrev !== null && (
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>vs campaña anterior:</span>
            <span
              className={cn(
                "font-semibold",
                balanceVsPrev >= 0
                  ? "text-(--primary-income)"
                  : "text-(--primary-expense)"
              )}
            >
              {balanceVsPrev >= 0 ? "+" : ""}
              {balanceVsPrev.toLocaleString("es-ES")}%
            </span>
          </div>
        )}
      </CardHeader>

      <LinkButton
        href="/dashboard/finance"
        text="Ver recomendaciones detalladas"
        include={SCOPE_KEYS.parcel}
      />
    </Card>
  )
}
