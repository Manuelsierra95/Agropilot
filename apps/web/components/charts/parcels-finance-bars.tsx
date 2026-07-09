"use client"

import {
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  YAxis,
} from "@workspace/ui/components/charts"
import { buildParcelChartRows } from "@workspace/web/lib/charts/chart-parcel-categories"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import type { DashboardParcelFinanceComparisonItem } from "@workspace/schemas"

type ParcelsFinanceBarsProps = {
  className?: string
  parcels: DashboardParcelFinanceComparisonItem[]
}

function formatCurrency(v: number) {
  if (Math.abs(v) >= 1_000) {
    return `${(v / 1_000).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}K €`
  }
  return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function ParcelsFinanceBars({
  className,
  parcels,
}: ParcelsFinanceBarsProps) {
  const chartData = buildParcelChartRows(parcels, (p) => ({
    income: p.income,
    expense: p.expense,
    profit: p.profit,
  }))

  const totalIncome = parcels.reduce((sum, p) => sum + p.income, 0)
  const totalExpense = parcels.reduce((sum, p) => sum + p.expense, 0)
  const totalProfit = parcels.reduce((sum, p) => sum + p.profit, 0)
  const isProfit = totalProfit >= 0

  return (
    <Card className={cn("w-full min-w-0 bg-background ring-0", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Comparativa financiera</CardTitle>
        <CardDescription className="text-xs">
          Ingresos y gastos por parcela en la campaña
        </CardDescription>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-2 pt-1">
          <div>
            <p className="text-[11px] text-muted-foreground">
              Ingresos totales
            </p>
            <p className="text-xl font-bold tracking-tight text-(--primary-income) tabular-nums">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Gastos totales</p>
            <p className="text-xl font-bold tracking-tight text-(--primary-expense) tabular-nums">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Balance total</p>
            <p
              className={cn(
                "text-xl font-bold tracking-tight tabular-nums",
                isProfit
                  ? "text-(--primary-income)"
                  : "text-(--primary-expense)"
              )}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pr-4 pb-0">
        <div className="mb-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-(--primary-income)" />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-(--primary-expense)" />
            Gastos
          </span>
        </div>
        <BarChart
          className="max-w-full min-w-0"
          data={chartData}
          xDataKey="axisLabel"
          barGap={0.25}
          aspectRatio="4 / 2"
          margin={{ top: 8, right: 12, bottom: 36, left: 44 }}
        >
          <Grid horizontal />
          <YAxis formatValue={(v) => (v === 0 ? "" : formatCurrency(v))} />
          <Bar dataKey="income" fill="var(--primary-income)" lineCap={3} />
          <Bar dataKey="expense" fill="var(--primary-expense)" lineCap={3} />
          <BarXAxis showAllLabels />
          <ChartTooltip
            showCrosshair={false}
            content={({ point }) => {
              const p = point as (typeof chartData)[number]
              return (
                <div className="flex flex-col gap-1 bg-secondary/90 p-3 text-xs">
                  <p className="font-medium">{p.fullName}</p>
                  <p className="text-(--primary-income)">
                    Ingresos: {formatCurrency(p.income)}
                  </p>
                  <p className="text-(--primary-expense)">
                    Gastos: {formatCurrency(p.expense)}
                  </p>
                  <p
                    className={cn(
                      "font-medium",
                      p.profit >= 0
                        ? "text-(--primary-income)"
                        : "text-(--primary-expense)"
                    )}
                  >
                    Beneficio: {formatCurrency(p.profit)}
                  </p>
                </div>
              )
            }}
          />
        </BarChart>
      </CardContent>
    </Card>
  )
}
