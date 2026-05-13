"use client"

import * as React from "react"
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { Label, Pie, PieChart, Sector, type SectorProps } from "recharts"

import type { Transaction } from "@/store/mockTransactions"
import type { KpiItem } from "./price-kpi-card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { Separator } from "@workspace/ui/components/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionSnapshot = Pick<
  Transaction,
  "type" | "category" | "amount" | "paymentMethod" | "invoiceNumber"
>

interface Recommendation {
  id: string
  priority: "alta" | "media" | "baja"
  icon: React.ReactNode
  title: string
  description: string
}

interface FinanceRecommendationsCompactProps {
  transactions: TransactionSnapshot[]
  oils: KpiItem[]
  className?: string
}

// ─── Chart config ─────────────────────────────────────────────────────────────

const chartConfig = {
  amount: { label: "Importe" },
  ingresos: { label: "Ingresos", color: "var(--chart-2)" },
  gastos: { label: "Gastos", color: "var(--chart-5)" },
} satisfies ChartConfig

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

export function FinanceRecommendationsCompact({
  transactions,
  oils,
  className,
}: FinanceRecommendationsCompactProps) {
  const id = "finance-donut"
  const { recs, totalIncome, totalExpenses } = buildRecommendations(
    transactions,
    oils
  )

  const balance = totalIncome - totalExpenses
  const isPositive = balance >= 0

  const chartData = [
    { slice: "ingresos", amount: totalIncome, fill: "var(--primary-income)" },
    { slice: "gastos", amount: totalExpenses, fill: "var(--primary-expense)" },
  ]

  const balanceLabel = `${isPositive ? "+" : ""}${balance.toLocaleString("es-ES")} €`

  const largestIndex = totalIncome >= totalExpenses ? 0 : 1 // 0 = income, 1 = expenses

  const renderActiveShape = React.useCallback(
    ({ outerRadius = 0, ...props }: SectorProps) => (
      <g>
        <Sector {...props} outerRadius={outerRadius + 5} />
      </g>
    ),
    []
  )

  return (
    <Card
      data-chart={id}
      className={cn("flex h-full flex-col gap-0 overflow-hidden", className)}
    >
      <CardHeader className="flex flex-col items-center gap-3 pb-4">
        <ChartStyle id={id} config={chartConfig} />

        {/* ── Donut + leyenda ── */}
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-square w-full max-w-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <>
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {Number(value).toLocaleString("es-ES")}
                        {"\u00A0"}€
                      </span>
                    </>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="slice"
              innerRadius={64}
              outerRadius={94}
              strokeWidth={3}
              activeIndex={largestIndex}
              activeShape={renderActiveShape}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-muted-foreground text-sm"
                        >
                          Balance
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 10}
                          style={{
                            fill: isPositive
                              ? "var(--primary-income)"
                              : "var(--primary-expense)",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                          }}
                        >
                          {balanceLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        {/* Leyenda */}
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
                  <span className="text-xs leading-snug font-semibold text-foreground">
                    {rec.title}
                  </span>
                  <Badge
                    variant={cfg.variant}
                    className="h-4 px-1.5 text-[10px] font-medium tracking-wide uppercase"
                  >
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {rec.description}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>

      <CardFooter className="flex items-center justify-center border-t border-border/60 px-4 py-2">
        <Link
          href="/dashboard/finance"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Ver recomendaciones detalladas</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}
