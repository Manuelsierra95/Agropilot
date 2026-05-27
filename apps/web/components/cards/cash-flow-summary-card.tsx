"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { cn } from "@workspace/ui/lib/utils"

import type { Transaction } from "@/store/mockTransactions"
import { ArrowDown, ArrowUp } from "lucide-react"
import { GradientSeparator } from "@/components/ui/gradient-separator"

type CashFlowTransaction = Pick<Transaction, "type" | "amount" | "date">

type BalanceSnapshot = {
  income: number
  expenses: number
  balance: number
}

type CashFlowChartPoint = {
  day: string
  trend?: number
  projection?: number
}

interface CashFlowSummaryCardProps {
  transactions: CashFlowTransaction[]
  className?: string
}

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const chartConfig = {
  trend: {
    label: "Tendencia 7d",
  },
  projection: {
    label: "Proyeccion 30d",
  },
} satisfies ChartConfig

const shortDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatSignedCurrency(value: number) {
  const abs = currencyFormatter.format(Math.abs(value))
  if (value === 0) return abs
  return value > 0 ? `+${abs}` : `-${abs}`
}

function formatChartDate(value: string | number) {
  const raw = typeof value === "string" ? value : String(value)
  const date = new Date(`${raw}T00:00:00`)
  if (Number.isNaN(date.getTime())) return raw
  return shortDateFormatter.format(date)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getAnchorDate(transactions: CashFlowTransaction[]) {
  if (transactions.length === 0) return new Date(0)
  const latest = Math.max(...transactions.map((t) => t.date.getTime()))
  return new Date(latest)
}

function getWindowRange(endDate: Date, days: number) {
  const start = addDays(endDate, -(days - 1))
  return { start, end: endDate }
}

function getWindowBalance(
  transactions: CashFlowTransaction[],
  start: Date,
  end: Date
): BalanceSnapshot {
  let income = 0
  let expenses = 0
  const startTs = start.getTime()
  const endTs = end.getTime()

  for (const tx of transactions) {
    const ts = tx.date.getTime()
    if (ts < startTs || ts > endTs) continue

    if (tx.type === "ingreso") {
      income += tx.amount
    } else {
      expenses += tx.amount
    }
  }

  return { income, expenses, balance: income - expenses }
}

function toneClass(value: number) {
  return value >= 0 ? "text-(--primary-income)" : "text-(--primary-expense)"
}

function buildCashFlowChartData(
  transactions: CashFlowTransaction[],
  anchorDate: Date,
  dailyRunRate: number
): CashFlowChartPoint[] {
  if (transactions.length === 0) return []

  const trendDays = 7
  const projectionDays = 30
  const anchorDay = startOfDay(anchorDate)
  const trendStart = addDays(anchorDay, -(trendDays - 1))

  const dailyNetByDay = new Map<string, number>()
  const startTs = trendStart.getTime()
  const endTs = anchorDay.getTime()

  for (const tx of transactions) {
    const day = startOfDay(tx.date)
    const ts = day.getTime()
    if (ts < startTs || ts > endTs) continue

    const key = getDayKey(day)
    const delta = tx.type === "ingreso" ? tx.amount : -tx.amount
    dailyNetByDay.set(key, (dailyNetByDay.get(key) ?? 0) + delta)
  }

  const points: CashFlowChartPoint[] = []
  let running = 0

  for (let i = 0; i < trendDays; i += 1) {
    const day = addDays(trendStart, i)
    const key = getDayKey(day)
    running += dailyNetByDay.get(key) ?? 0
    points.push({ day: key, trend: running })
  }

  const lastIndex = points.length - 1
  const lastValue = points[lastIndex]?.trend ?? 0
  points[lastIndex] = { ...points[lastIndex], projection: lastValue }

  let projectionValue = lastValue
  for (let i = 1; i <= projectionDays; i += 1) {
    projectionValue += dailyRunRate
    const day = addDays(anchorDay, i)
    points.push({ day: getDayKey(day), projection: projectionValue })
  }

  return points
}

export function CashFlowSummaryCard({
  transactions,
  className,
}: CashFlowSummaryCardProps) {
  const anchorDate = getAnchorDate(transactions)
  const last7Range = getWindowRange(anchorDate, 7)
  const last30Range = getWindowRange(anchorDate, 30)

  const last7 = getWindowBalance(transactions, last7Range.start, last7Range.end)
  const last30 = getWindowBalance(
    transactions,
    last30Range.start,
    last30Range.end
  )

  const dailyRunRate = last7.balance / 7
  const chartData = buildCashFlowChartData(
    transactions,
    anchorDate,
    dailyRunRate
  )

  return (
    <Card
      className={cn(
        "flex h-full w-full flex-col bg-background ring-0",
        className
      )}
    >
      <CardHeader className="space-y-1 pb-0">
        <CardTitle className="text-sm font-medium">Flujo de Caja</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Resumen de ingresos y gastos recientes, con proyección a futuro.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="flex justify-start gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Últimos 7 días
            </span>
            <div
              className={cn(
                "text-2xl font-semibold tracking-tight",
                toneClass(last7.balance)
              )}
            >
              {formatSignedCurrency(last7.balance)}
            </div>
            <ul className="flex gap-2 text-[10px] text-muted-foreground">
              <li className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3 text-(--primary-income-muted)" />
                {formatCurrency(last7.income)}
              </li>
              <li className="flex items-center gap-1">
                <ArrowDown className="h-3 w-3 text-(--primary-expense-muted)" />
                {formatCurrency(last7.expenses)}
              </li>
            </ul>
          </div>

          <GradientSeparator />

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Últimos 30 días
            </span>
            <div
              className={cn(
                "text-2xl font-semibold tracking-tight",
                toneClass(last30.balance)
              )}
            >
              {formatSignedCurrency(last30.balance)}
            </div>
            <ul className="flex gap-2 text-[10px] text-muted-foreground">
              <li className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3 text-(--primary-income-muted)" />
                {formatCurrency(last30.income)}
              </li>
              <li className="flex items-center gap-1">
                <ArrowDown className="h-3 w-3 text-(--primary-expense-muted)" />
                {formatCurrency(last30.expenses)}
              </li>
            </ul>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[160px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 8,
              left: 8,
              right: 8,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatChartDate}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatChartDate(value)}
                  formatter={(value, name) => (
                    <>
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatSignedCurrency(Number(value))}
                      </span>
                    </>
                  )}
                />
              }
            />
            <Line
              dataKey="trend"
              type="linear"
              stroke="var(--color-trend)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="projection"
              type="linear"
              stroke="var(--color-projection)"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <span className="text-xs text-muted-foreground underline decoration-dashed underline-offset-2">
          Proyección basada en tendencia reciente
        </span>
      </CardContent>
    </Card>
  )
}
