"use client"

import * as React from "react"
import { type ChartConfig } from "@workspace/ui/components/chart"
import { type Transaction } from "@/store/mockTransactions"
import { ExpensesDrawer } from "../drawer/expenses-drawer"
import type { CategoryTransaction } from "../drawer/components/category-drawer"
import { FinancePieChart, type PieChartDataItem } from "./components/pie-chart"

const chartConfig = {
  semillas: { label: "Semillas", color: "var(--pie-expense-1)" },
  fertilizantes: { label: "Fertilizantes", color: "var(--pie-expense-2)" },
  fitosanitarios: { label: "Fitosanitarios", color: "var(--pie-expense-3)" },
  combustible: { label: "Combustible", color: "var(--pie-expense-4)" },
  manodeobra: { label: "Mano de obra", color: "var(--pie-expense-5)" },
  seguros: { label: "Seguros", color: "var(--pie-expense-6)" },
  maquinaria: { label: "Maquinaria", color: "var(--pie-expense-7)" },
  riego: { label: "Riego", color: "var(--pie-expense-8)" },
} satisfies ChartConfig

const categoryToKey: Record<string, string> = {
  Semillas: "semillas",
  Fertilizantes: "fertilizantes",
  Fitosanitarios: "fitosanitarios",
  Combustible: "combustible",
  "Mano de obra": "manodeobra",
  Seguros: "seguros",
  Maquinaria: "maquinaria",
  Riego: "riego",
}

function buildExpenseChartData(
  transactions: Transaction[]
): PieChartDataItem[] {
  const totalsByCategory = transactions
    .filter((transaction) => transaction.type === "gasto")
    .reduce<Record<string, number>>((acc, transaction) => {
      const key = categoryToKey[transaction.category]
      if (!key) return acc

      acc[transaction.category] =
        (acc[transaction.category] ?? 0) + transaction.amount
      return acc
    }, {})

  return Object.entries(totalsByCategory)
    .map(([category, amount]) => {
      const key = categoryToKey[category]
      return {
        category,
        amount,
        fill: `var(--color-${key})`,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

function buildExpenseTransactionsByCategory(
  transactions: Transaction[]
): Record<string, CategoryTransaction[]> {
  return transactions
    .filter((transaction) => transaction.type === "gasto")
    .reduce<Record<string, CategoryTransaction[]>>((acc, transaction) => {
      const key = categoryToKey[transaction.category]
      if (!key) return acc

      const tx: CategoryTransaction = {
        id: transaction.id,
        date: transaction.date,
        concept: transaction.concept,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        invoiceNumber: transaction.invoiceNumber,
      }

      if (!acc[transaction.category]) {
        acc[transaction.category] = []
      }
      acc[transaction.category]!.push(tx)
      return acc
    }, {})
}

export function ExpensesPieChart({ data }: { data: Transaction[] }) {
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
