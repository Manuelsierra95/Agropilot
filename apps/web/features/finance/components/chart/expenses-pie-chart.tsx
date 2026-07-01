"use client"

import * as React from "react"
import { type ChartConfig } from "@workspace/ui/components/chart"
import type { FinanceTransaction } from "@workspace/web/lib/finance/types"
import { ExpensesDrawer } from "@workspace/web/features/finance/components/drawer/expenses-drawer"
import type { CategoryTransaction } from "@workspace/web/features/finance/components/drawer/components/category-drawer"
import { FinancePieChart, type PieChartDataItem } from "@workspace/web/features/finance/components/chart/components/pie-chart"

const chartConfig = {
  riego: { label: "Riego", color: "var(--pie-expense-1)" },
  fertilizacion: { label: "Fertilización", color: "var(--pie-expense-2)" },
  tratamiento: { label: "Tratamiento", color: "var(--pie-expense-3)" },
  combustible: { label: "Combustible", color: "var(--pie-expense-4)" },
  manodeobra: { label: "Mano de obra", color: "var(--pie-expense-5)" },
  maquinaria: { label: "Maquinaria", color: "var(--pie-expense-6)" },
  cosecha: { label: "Cosecha", color: "var(--pie-expense-7)" },
  otros: { label: "Otros", color: "var(--pie-expense-8)" },
} satisfies ChartConfig

const categoryToKey: Record<string, string> = {
  Riego: "riego",
  Fertilización: "fertilizacion",
  Tratamiento: "tratamiento",
  Combustible: "combustible",
  "Mano de obra": "manodeobra",
  Maquinaria: "maquinaria",
  Cosecha: "cosecha",
  Otros: "otros",
}

function resolveCategoryKey(category: string): string {
  return categoryToKey[category] ?? "otros"
}

function buildExpenseChartData(
  transactions: FinanceTransaction[]
): PieChartDataItem[] {
  const totalsByCategory = transactions
    .filter((transaction) => transaction.type === "gasto")
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

function buildExpenseTransactionsByCategory(
  transactions: FinanceTransaction[]
): Record<string, CategoryTransaction[]> {
  return transactions
    .filter((transaction) => transaction.type === "gasto")
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

export function ExpensesPieChart({ data }: { data: FinanceTransaction[] }) {
  const chartData = React.useMemo(() => buildExpenseChartData(data), [data])
  const transactionsByCategory = React.useMemo(
    () => buildExpenseTransactionsByCategory(data),
    [data]
  )

  return (
    <FinancePieChart
      id="pie-gastos"
      title="Distribución de Gastos"
      data={chartData}
      chartConfig={chartConfig}
      categoryToKey={categoryToKey}
      renderDrawer={(props) => (
        <ExpensesDrawer
          {...props}
          transactions={transactionsByCategory[props.category] ?? []}
        />
      )}
    />
  )
}
