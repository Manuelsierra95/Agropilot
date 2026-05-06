"use client"

import * as React from "react"
import { type ChartConfig } from "@workspace/ui/components/chart"
import { type Transaction } from "@/store/mockTransactions"
import { IncomeDrawer } from "../drawer/income-drawer"
import type { CategoryTransaction } from "../drawer/category-drawer"
import { FinancePieChart, type PieChartDataItem } from "./pie-chart"

const chartConfig = {
  amount: { label: "Monto (€)" },
  cereales: { label: "Venta de cereales", color: "var(--chart-1)" },
  girasol: { label: "Venta de girasol", color: "var(--chart-2)" },
  pac: { label: "Subvenciones PAC", color: "var(--chart-3)" },
  arrendamiento: { label: "Arrendamiento de tierras", color: "var(--chart-4)" },
  leguminosas: { label: "Venta de leguminosas", color: "var(--chart-5)" },
  servicios: {
    label: "Servicios agronómicos",
    color: "var(--chart-6, var(--chart-1))",
  },
  agroseguros: {
    label: "Agroseguros / indemnizaciones",
    color: "var(--chart-7, var(--chart-2))",
  },
  otros: { label: "Otros ingresos", color: "var(--chart-8, var(--chart-3))" },
} satisfies ChartConfig

const categoryToKey: Record<string, string> = {
  "Venta de cereales": "cereales",
  "Venta de girasol": "girasol",
  "Subvenciones PAC": "pac",
  "Arrendamiento de tierras": "arrendamiento",
  "Venta de leguminosas": "leguminosas",
  "Servicios agronómicos": "servicios",
  "Agroseguros / indemnizaciones": "agroseguros",
  "Otros ingresos": "otros",
  // Alias para categorías actuales del mock
  "Venta de cosecha": "cereales",
  Subvenciones: "pac",
}

function buildIncomeChartData(transactions: Transaction[]): PieChartDataItem[] {
  const totalsByCategory = transactions
    .filter((transaction) => transaction.type === "ingreso")
    .reduce<Record<string, number>>((acc, transaction) => {
      const key = categoryToKey[transaction.category]
      if (!key) return acc

      const normalizedCategory =
        key === "cereales"
          ? "Venta de cereales"
          : key === "pac"
            ? "Subvenciones PAC"
            : transaction.category

      acc[normalizedCategory] =
        (acc[normalizedCategory] ?? 0) + transaction.amount

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

function buildIncomeTransactionsByCategory(
  transactions: Transaction[]
): Record<string, CategoryTransaction[]> {
  return transactions
    .filter((transaction) => transaction.type === "ingreso")
    .reduce<Record<string, CategoryTransaction[]>>((acc, transaction) => {
      const key = categoryToKey[transaction.category]
      if (!key) return acc

      const normalizedCategory =
        key === "cereales"
          ? "Venta de cereales"
          : key === "pac"
            ? "Subvenciones PAC"
            : transaction.category

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

export function IncomePieChart({ data }: { data: Transaction[] }) {
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
