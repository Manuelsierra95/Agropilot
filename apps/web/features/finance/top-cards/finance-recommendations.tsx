import { TrendingUp, AlertTriangle, Lightbulb, ShieldCheck } from "lucide-react"
import type { Transaction } from "@/store/mockTransactions"
import type { KpiItem } from "./kpi-card/price-kpi-card"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"

interface Recommendation {
  id: string
  priority: "alta" | "media" | "baja"
  icon: React.ReactNode
  title: string
  description: string
}

interface FinanceRecommendationsProps {
  transactions: Transaction[]
  oils: KpiItem[]
}

function buildRecommendations(
  transactions: Transaction[],
  oils: KpiItem[]
): { recs: Recommendation[]; totalIncome: number; totalExpenses: number } {
  const recs: Recommendation[] = []

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
  const margin = ((balance / totalIncome) * 100).toFixed(1)

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
    const pct = ((amount / totalExpenses) * 100).toFixed(0)
    recs.push({
      id: "top-expense",
      priority: "media",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: `${cat} supone el ${pct}% del gasto`,
      description: `${amount.toLocaleString("es-ES")} € en ${cat.toLowerCase()}. Agrupa compras con otros agricultores para reducir esta partida.`,
    })
  }

  const virgenExtra = oils.find((o) => o.name === "Virgen Extra")
  if (virgenExtra) {
    const range = virgenExtra.priceMax - virgenExtra.priceMin
    const posicion = (virgenExtra.price - virgenExtra.priceMin) / range
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

  return { recs: recs.slice(0, 3), totalIncome, totalExpenses }
}

const priorityConfig = {
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

export function FinanceRecommendations({
  transactions,
  oils,
}: FinanceRecommendationsProps) {
  const { recs, totalIncome, totalExpenses } = buildRecommendations(
    transactions,
    oils
  )
  const balance = totalIncome - totalExpenses
  const isPositive = balance >= 0
  const max = Math.max(totalIncome, totalExpenses)
  const incomeWidth = (totalIncome / max) * 100
  const expensesWidth = (totalExpenses / max) * 100

  return (
    <Card className="h-full overflow-hidden p-0">
      <CardContent className="flex h-full divide-x p-0">
        {/* ── Col 1: Resumen financiero ── */}
        <div className="flex w-[260px] shrink-0 flex-col justify-center gap-6 px-6 py-6">
          {/* Barras */}
          <div className="flex flex-col gap-4">
            {/* Ingresos */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Ingresos
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {totalIncome.toLocaleString("es-ES")} €
                </span>
              </div>
              <Progress
                value={incomeWidth}
                className="h-2 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-400"
              />
            </div>

            {/* Gastos */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Gastos
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {totalExpenses.toLocaleString("es-ES")} €
                </span>
              </div>
              <Progress
                value={expensesWidth}
                className="h-2 [&>div]:bg-red-500 dark:[&>div]:bg-red-400"
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t" />

          {/* Balance */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Balance
            </span>
            <span
              className={`text-center text-3xl font-bold tracking-tight ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {balance.toLocaleString("es-ES")} €
            </span>
          </div>
        </div>

        {/* ── Col 2: Recomendaciones ── */}
        <div className="flex flex-1 flex-col divide-y">
          {recs.map((rec) => {
            const cfg = priorityConfig[rec.priority]
            return (
              <div
                key={rec.id}
                className="flex flex-1 items-start gap-4 px-5 py-5 transition-colors hover:bg-muted/40"
              >
                <div className={`mt-0.5 shrink-0 ${cfg.iconClass}`}>
                  {rec.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm leading-snug font-semibold text-foreground">
                      {rec.title}
                    </span>
                    <Badge
                      variant={cfg.variant}
                      className="h-5 px-2 text-[11px] font-medium tracking-wide uppercase"
                    >
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
