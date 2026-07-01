"use client"

import * as React from "react"
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { PreservedLink } from "@workspace/web/components/preserved-link"
import { SCOPE_KEYS } from "@workspace/web/lib/navigation/scope"
import { Separator } from "@workspace/ui/components/separator"
import { buttonVariants } from "@workspace/ui/components/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionSnapshot = FinanceTransactionSnapshot

interface Recommendation {
  id: string
  priority: "alta" | "media" | "baja"
  icon: React.ReactNode
  title: string
  description: string
}

interface FinanceRecommendationsCardProps {
  transactions: TransactionSnapshot[]
  oils: KpiItem[]
  redirectButton?: boolean
  className?: string
}

// ─── Business logic ───────────────────────────────────────────────────────────

function buildRecommendations(
  transactions: TransactionSnapshot[],
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

  return { recs: recs.slice(0, 3), totalIncome, totalExpenses }
}

// ─── Priority config ──────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function FinanceRecommendationsCard({
  transactions,
  oils,
  redirectButton = true,
  className,
}: FinanceRecommendationsCardProps) {
  const { recs, totalIncome, totalExpenses } = buildRecommendations(
    transactions,
    oils
  )

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
        "flex h-full flex-col gap-0 overflow-hidden bg-background pt-0 ring-0",
        className
      )}
    >
      <CardHeader className="flex flex-col items-center gap-0 pb-4">
        {/* ── Gauge ── */}
        <div className="mx-auto flex h-full max-w-[220px] justify-center">
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
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-0 p-0">
        <Separator className="w-full bg-border/70" />
        {recs.map((rec) => {
          const cfg = priorityConfig[rec.priority]
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

                <ClampedTooltip text={rec.description} />
              </div>
            </div>
          )
        })}
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

function ClampedTooltip({ text }: { text: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = React.useState(false)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (el) setIsClamped(el.scrollHeight > el.clientHeight)
  }, [text])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p
          ref={ref}
          className="line-clamp-1 cursor-default text-xs leading-relaxed text-muted-foreground"
        >
          {text}
        </p>
      </TooltipTrigger>
      {isClamped && (
        <TooltipContent
          side="bottom"
          className="max-w-[260px] text-xs leading-relaxed"
        >
          {text}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
