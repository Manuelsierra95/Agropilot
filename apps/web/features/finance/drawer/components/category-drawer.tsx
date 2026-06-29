"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { IconSettings } from "@tabler/icons-react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { TransactionTable } from "@workspace/web/features/finance/table"
import type { Transaction as TableTransaction } from "@workspace/web/features/finance/table/types"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { cn } from "@workspace/ui/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryTransaction {
  id: string
  date: Date
  concept: string
  amount: number
  paymentMethod:
    | "transferencia"
    | "tarjeta"
    | "efectivo"
    | "cheque"
    | "otro"
    | null
  invoiceNumber: string | null
}

export type CategoryDrawerVariant = "income" | "expenses"

export type IconComponent = React.ComponentType<{
  size?: number
  className?: string
}>

export interface CategoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  amount: number
  percentage: string
  color: string
  /** Controla los textos y colores según el tipo de movimiento */
  variant: CategoryDrawerVariant
  /** Mapa de nombre de categoría → icono. Si falta la categoría se usa IconSettings. */
  categoryIcons?: Record<string, IconComponent>
  /** Datos de transacciones indexados por nombre de categoría */
  dataByCategory?: Record<string, CategoryTransaction[]>
  /** Permite inyectar transacciones ya filtradas desde el pie chart */
  transactions?: CategoryTransaction[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    v
  )

function buildMonthlyData(transactions: CategoryTransaction[]) {
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    mes: MONTHS_ES[i]!,
    importe: 0,
  }))
  for (const tx of transactions) {
    const month = tx.date.getMonth()
    monthly[month]!.importe += tx.amount
  }
  return monthly
}

// ---------------------------------------------------------------------------
// Variantes de texto / color
// ---------------------------------------------------------------------------

const VARIANT_CONFIG = {
  income: {
    chartLabel: "Ingreso (€)",
    accumulatedLabel: "Ingreso acumulado 2024",
    kpiAvgLabel: "Ingreso medio mensual",
    kpiMaxLabel: "Mayor ingreso",
    insightPeakText: "ingreso",
    insightTrendText: "ingreso",
    trendPositiveClass: "text-emerald-600 dark:text-emerald-400",
    trendNegativeClass: "text-red-600 dark:text-red-400",
    amountClass: "text-emerald-600 dark:text-emerald-400",
    tableAmountClass: "text-emerald-600 dark:text-emerald-400",
  },
  expenses: {
    chartLabel: "Gasto (€)",
    accumulatedLabel: "Gasto acumulado 2024",
    kpiAvgLabel: "Gasto medio mensual",
    kpiMaxLabel: "Mayor gasto",
    insightPeakText: "gasto",
    insightTrendText: "gasto",
    trendPositiveClass: "text-red-600 dark:text-red-400",
    trendNegativeClass: "text-emerald-600 dark:text-emerald-400",
    amountClass: "",
    tableAmountClass: "",
  },
} as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card size="sm" className="flex-1">
      <CardContent className="pt-3 pb-3">
        <p className="mb-1 text-[11px] text-muted-foreground">{label}</p>
        <p className="text-base font-semibold tabular-nums">{value}</p>
        {sub && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CategoryDrawer({
  open,
  onOpenChange,
  category,
  amount,
  percentage,
  color,
  variant,
  categoryIcons = {},
  dataByCategory,
  transactions: transactionsProp,
}: CategoryDrawerProps) {
  const cfg = VARIANT_CONFIG[variant]

  const transactions = React.useMemo(
    () => transactionsProp ?? dataByCategory?.[category] ?? [],
    [transactionsProp, dataByCategory, category]
  )

  const avgMonthly = amount / 12
  const maxTx = transactions.length
    ? transactions.reduce(
        (m, t) => (t.amount > m.amount ? t : m),
        transactions[0]!
      )
    : null

  const monthlyData = React.useMemo(
    () => buildMonthlyData(transactions),
    [transactions]
  )

  const tableData = React.useMemo<TableTransaction[]>(
    () =>
      transactions
        .slice()
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((tx) => ({
          id: tx.id,
          userId: null,
          parcelId: null,
          type: variant === "income" ? "ingreso" : "gasto",
          category,
          concept: tx.concept,
          amount: tx.amount,
          paymentMethod: tx.paymentMethod,
          invoiceNumber: tx.invoiceNumber,
          date: tx.date,
          description: null,
          createdAt: tx.date,
          updatedAt: tx.date,
        })),
    [transactions, variant, category]
  )

  const peakMonth = monthlyData.reduce(
    (best, m, i) => (m.importe > (monthlyData[best]?.importe ?? 0) ? i : best),
    0
  )
  const lastMonth = monthlyData[10]
  const prevMonth = monthlyData[9]
  const trend =
    lastMonth && prevMonth && prevMonth.importe > 0
      ? ((lastMonth.importe - prevMonth.importe) / prevMonth.importe) * 100
      : null

  const withInvoice = transactions.filter(
    (t) => t.invoiceNumber !== null
  ).length
  const invoicePct =
    transactions.length > 0
      ? ((withInvoice / transactions.length) * 100).toFixed(0)
      : "0"

  void (categoryIcons[category] ?? IconSettings)

  const chartConfig = {
    importe: { label: cfg.chartLabel, color },
  } satisfies ChartConfig

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <DrawerHeader className="border-b px-6 py-5">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle className="text-base font-semibold">
                  {category}
                </DrawerTitle>
                <Badge variant="secondary" className="text-[11px]">
                  {percentage}% del total
                </Badge>
              </div>
              <DrawerDescription className="mt-0.5 flex justify-start text-sm">
                {cfg.accumulatedLabel}
              </DrawerDescription>
            </div>
            <p
              className={cn(
                "shrink-0 text-xl font-bold tabular-nums",
                cfg.amountClass
              )}
            >
              {formatCurrency(amount)}
            </p>
          </div>
        </DrawerHeader>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <ScrollArea className="overflow-y-auto">
          <div className="flex flex-col gap-6 px-6 py-5">
            {/* ── KPI cards ──────────────────────────────────────────────── */}
            <div className="flex gap-3">
              <KpiCard
                label={cfg.kpiAvgLabel}
                value={formatCurrency(avgMonthly)}
              />
              <KpiCard
                label="Transacciones"
                value={String(transactions.length)}
                sub="en 2024"
              />
              <KpiCard
                label={cfg.kpiMaxLabel}
                value={maxTx ? formatCurrency(maxTx.amount) : "—"}
                sub={
                  maxTx
                    ? maxTx.concept.split(" ").slice(0, 3).join(" ") + "…"
                    : undefined
                }
              />
            </div>

            {/* ── Monthly evolution chart ─────────────────────────────────── */}
            <div>
              <p className="mb-3 text-sm font-medium">
                Evolución mensual — 2024
              </p>
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`grad-${category}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) =>
                      v === 0
                        ? "0"
                        : `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? "k" : ""}`
                    }
                    width={36}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="importe"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-${category})`}
                    dot={{ r: 3, fill: color, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* ── Insights ─────────────────────────────────────────────────── */}
            <div className="rounded-xl border bg-muted/30 px-4 py-4">
              <p className="mb-3 text-sm font-medium">Análisis</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-base leading-none">📅</span>
                  <span>
                    El mes de mayor {cfg.insightPeakText} fue{" "}
                    <strong className="text-foreground">
                      {MONTHS_ES[peakMonth]}
                    </strong>{" "}
                    con{" "}
                    <strong className="text-foreground">
                      {formatCurrency(monthlyData[peakMonth]?.importe ?? 0)}
                    </strong>
                    .
                  </span>
                </li>

                {trend !== null && (
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-base leading-none">
                      {trend >= 0 ? "📈" : "📉"}
                    </span>
                    <span>
                      El {cfg.insightTrendText} de noviembre fue un{" "}
                      <strong
                        className={cn(
                          "font-semibold",
                          trend >= 0
                            ? cfg.trendPositiveClass
                            : cfg.trendNegativeClass
                        )}
                      >
                        {trend >= 0 ? "+" : ""}
                        {trend.toFixed(1)}%
                      </strong>{" "}
                      respecto a octubre.
                    </span>
                  </li>
                )}

                <li className="flex gap-2">
                  <span className="mt-0.5 text-base leading-none">🧾</span>
                  <span>
                    <strong className="text-foreground">{invoicePct}%</strong>{" "}
                    de las transacciones cuentan con número de factura
                    registrado.
                  </span>
                </li>
              </ul>
            </div>

            {/* ── Transactions table ─────────────────────────────────────── */}
            <div>
              <p className="mb-3 text-sm font-medium">
                Transacciones ({transactions.length})
              </p>
              <TransactionTable
                data={tableData}
                filtersSection={true}
                enabledFilters={[
                  "columns",
                  "amount",
                  "dates",
                  "paymentMethods",
                  "searchBar",
                ]}
              />
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
