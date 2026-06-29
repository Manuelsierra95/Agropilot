"use client"

import * as React from "react"
import { type ChartConfig } from "@workspace/ui/components/chart"
import type { FinanceTransaction } from "@workspace/web/lib/finance/types"
import { IncomeDrawer } from "@workspace/web/features/finance/drawer/income-drawer"
import type { CategoryTransaction } from "@workspace/web/features/finance/drawer/components/category-drawer"
import { FinancePieChart, type PieChartDataItem } from "@workspace/web/features/finance/chart/components/pie-chart"

const chartConfig = {
  venta: { label: "Venta de cosecha", color: "var(--pie-income-1)" },
  subvenciones: { label: "Subvenciones", color: "var(--pie-income-2)" },
  otros: { label: "Otros", color: "var(--pie-income-3)" },
} satisfies ChartConfig

const categoryToKey: Record<string, string> = {
  "Venta de cosecha": "venta",
  Subvenciones: "subvenciones",
}

function resolveCategoryKey(category: string): string {
  return categoryToKey[category] ?? "otros"
}

function buildIncomeChartData(
  transactions: FinanceTransaction[]
): PieChartDataItem[] {
  const totalsByCategory = transactions
    .filter((transaction) => transaction.type === "ingreso")
    .reduce<Record<string, number>>((acc, transaction) => {
      const key = resolveCategoryKey(transaction.category)
      const label =
        key === "otros" && !categoryToKey[transaction.category]
          ? transaction.category
          : (chartConfig[key as keyof typeof chartConfig]?.label ??
            transaction.category)

      acc[label] = (acc[label] ?? 0) + transaction.amount
      return acc
    }, {})

  return Object.entries(totalsByCategory)
    .map(([category, amount]) => {
      const key = categoryToKey[category] ?? "otros"
      return {
        category,
        amount,
        fill: `var(--color-${key})`,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

function buildIncomeTransactionsByCategory(
  transactions: FinanceTransaction[]
): Record<string, CategoryTransaction[]> {
  return transactions
    .filter((transaction) => transaction.type === "ingreso")
    .reduce<Record<string, CategoryTransaction[]>>((acc, transaction) => {
      const key = resolveCategoryKey(transaction.category)
      const normalizedCategory =
        key === "otros" && !categoryToKey[transaction.category]
          ? transaction.category
          : (chartConfig[key as keyof typeof chartConfig]?.label ??
            transaction.category)

      const tx: CategoryTransaction = {
        id: transaction.id,
        date: transaction.date,
        concept: transaction.concept,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        invoiceNumber: transaction.invoiceNumber,
      }

      if (!acc[normalizedCategory]) {
        acc[normalizedCategory] = []
      }
      acc[normalizedCategory]!.push(tx)
      return acc
    }, {})
}

export function IncomePieChart({ data }: { data: FinanceTransaction[] }) {
  const chartData = React.useMemo(() => buildIncomeChartData(data), [data])
  const transactionsByCategory = React.useMemo(
    () => buildIncomeTransactionsByCategory(data),
    [data]
  )

  return (
    <FinancePieChart
      id="pie-ingresos"
      title="Distribución de Ingresos"
      data={chartData}
      chartConfig={chartConfig}
      categoryToKey={categoryToKey}
      renderDrawer={(props) => (
        <IncomeDrawer
          {...props}
          transactions={transactionsByCategory[props.category] ?? []}
        />
      )}
    />
  )
}
