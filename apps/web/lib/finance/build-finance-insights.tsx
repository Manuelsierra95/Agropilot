import {
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import type { ReactNode } from "react"

import type { FinanceTransactionSnapshot } from "@workspace/web/lib/finance/types"
import type { Item as KpiItem } from "@workspace/web/features/dashboard/components/olive-price"

export type FinanceInsightPriority = "alta" | "media" | "baja"

export type FinanceInsight = {
  id: string
  priority: FinanceInsightPriority
  icon: ReactNode
  title: string
  description: string
}

export function buildFinanceInsights(
  transactions: FinanceTransactionSnapshot[],
  oils: KpiItem[]
): FinanceInsight[] {
  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((a, t) => a + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "gasto")
    .reduce((a, t) => a + t.amount, 0)

  if (transactions.length === 0) {
    return []
  }

  const recs: FinanceInsight[] = []

  const expensesByCategory = transactions
    .filter((t) => t.type === "gasto")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const balance = totalIncome - totalExpenses
  const margin =
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0"

  if (balance > 0) {
    recs.push({
      id: "margin",
      priority: "baja",
      icon: <ShieldCheck className="h-4 w-4" />,
      title: `Margen neto del ${margin}%`,
      description: `Ingresos de ${totalIncome.toLocaleString("es-ES")} € vs. gastos de ${totalExpenses.toLocaleString("es-ES")} €. Considera reinvertir el excedente.`,
    })
  } else {
    recs.push({
      id: "margin-neg",
      priority: "alta",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Balance negativo",
      description: `Tus gastos superan los ingresos en ${Math.abs(balance).toLocaleString("es-ES")} €. Revisa las partidas de mayor coste.`,
    })
  }

  const topExpenseCategory = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a
  )[0]
  if (topExpenseCategory) {
    const [cat, amount] = topExpenseCategory
    const pct =
      totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : "0"
    recs.push({
      id: "top-expense",
      priority: "media",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: `${cat} supone el ${pct}% del gasto`,
      description: `${amount.toLocaleString("es-ES")} € en ${cat.toLowerCase()}. Agrupa compras con otros agricultores para reducir esta partida.`,
    })
  }

  const virgenExtra = oils.find((o) =>
    o.name.toLowerCase().includes("virgen extra")
  )
  if (virgenExtra) {
    const range = virgenExtra.priceMax - virgenExtra.priceMin
    const posicion =
      range > 0 ? (virgenExtra.price - virgenExtra.priceMin) / range : 0
    if (posicion > 0.5) {
      recs.push({
        id: "oil-price",
        priority: posicion > 0.7 ? "alta" : "media",
        icon: <TrendingUp className="h-4 w-4" />,
        title: "Virgen Extra en zona alta",
        description: `A ${virgenExtra.price} €/kg estás en el ${Math.round(posicion * 100)}% del rango. Buen momento para cerrar ventas.`,
      })
    } else {
      const cashNoInvoice = transactions.filter(
        (t) => t.paymentMethod === "efectivo" && !t.invoiceNumber
      )
      const total = cashNoInvoice.reduce((a, t) => a + t.amount, 0)
      recs.push({
        id: "cash",
        priority: "media",
        icon: <Lightbulb className="h-4 w-4" />,
        title: `${cashNoInvoice.length} pagos sin factura`,
        description: `Suman ${total.toLocaleString("es-ES")} €. Solicita justificante para poder deducirlos.`,
      })
    }
  }

  return recs.slice(0, 5)
}

export const financeInsightPriorityConfig = {
  alta: {
    variant: "destructive" as const,
    label: "Alta",
    iconClass: "text-destructive",
  },
  media: {
    variant: "outline" as const,
    label: "Media",
    iconClass: "text-amber-500 dark:text-amber-400",
  },
  baja: {
    variant: "outline" as const,
    label: "Baja",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
}
