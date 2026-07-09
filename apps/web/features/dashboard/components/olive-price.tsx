"use client"

import { useMemo, useState } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import {
  LineChart,
  Line,
  Grid,
  ChartTooltip,
  curveLinear,
} from "@workspace/ui/components/charts"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PricePoint {
  date: string
  price: number
}

export interface Item {
  name: string
  price: number
  priceMin: number
  priceMax: number
  unit: string
  updatedAt: string
  history: PricePoint[]
}

interface OlivePriceCardProps {
  items: Item[]
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildChartData(history: PricePoint[]) {
  if (!history.length) return []

  const prices = history.map((p) => p.price)
  const baseline = Math.min(...prices)

  // Convierte cada precio a su diferencia respecto al mínimo
  // yScale arrancará desde 0 (el punto más bajo) y mostrará la variación real
  return history.map((p) => ({
    date: new Date(p.date),
    price: p.price, // precio real → para el tooltip
    delta: p.price - baseline, // delta desde mínimo → para la línea
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OlivePrice({ items, className }: OlivePriceCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null

  const chartData = useMemo(
    () => (selectedItem ? buildChartData(selectedItem.history) : []),
    [selectedItem]
  )

  return (
    <Card
      className={cn(
        "h-fit overflow-hidden bg-background p-0 ring-0",
        className
      )}
    >
      {/* ── Fila de items ── */}
      <div
        className="grid w-full grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-px"
        style={{ "--cols": items.length } as React.CSSProperties}
      >
        {items.map((item, index) => {
          const isUp = item.price >= (item.priceMin + item.priceMax) / 2
          const isSelected = selectedIndex === index

          return (
            <div key={item.name} className="flex">
              {index > 0 && <GradientSeparator orientation="vertical" />}
              <button
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "flex flex-1 cursor-pointer flex-col gap-2 text-left transition-colors",
                  "rounded-xl hover:bg-muted/40 focus-visible:ring-ring focus-visible:outline-none"
                )}
              >
                <CardContent className="flex flex-col gap-1 p-1.5 sm:gap-2 sm:p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "truncate text-[10px] font-medium transition-colors sm:text-sm",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full transition-opacity",
                        isSelected ? "bg-foreground opacity-100" : "opacity-0"
                      )}
                    />
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-0.5 sm:gap-1">
                    <span className="text-base font-semibold tracking-tight text-foreground sm:text-xl">
                      {item.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground sm:text-sm">
                      {item.unit}
                    </span>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center gap-1 text-[10px] font-medium">
                    <div className="relative h-3 w-3 sm:h-3.5 sm:w-3.5">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full",
                          isUp
                            ? "bg-(--primary-income)"
                            : "bg-(--primary-expense)"
                        )}
                      />
                      {isUp ? (
                        <ArrowUp className="absolute inset-0 m-auto h-1.5 w-1.5 text-black sm:h-2 sm:w-2" />
                      ) : (
                        <ArrowDown className="absolute inset-0 m-auto h-1.5 w-1.5 text-black sm:h-2 sm:w-2" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "truncate font-semibold",
                        isUp
                          ? "text-(--primary-income)"
                          : "text-(--primary-expense)"
                      )}
                    >
                      10%
                    </span>
                  </div>
                </CardContent>
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Chart expandible ── */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          selectedItem
            ? "max-h-64 pb-2 opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        )}
      >
        {selectedItem && (
          <>
            <GradientSeparator orientation="horizontal" />
            <div className="px-4 pt-4 pb-2">
              <p className="mb-3 text-xs text-muted-foreground">
                Evolución —{" "}
                <span className="font-medium text-foreground">
                  {selectedItem.name}
                </span>
              </p>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 28, bottom: 48, left: 28 }}
                aspectRatio="3 / 1"
              >
                <Grid horizontal numTicksRows={3} />
                <Line
                  curve={curveLinear}
                  dataKey="delta"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: "var(--chart-1)",
                      label: selectedItem.name,
                      value: `${(point.price as number).toFixed(2)} ${selectedItem.unit}`,
                    },
                  ]}
                />
              </LineChart>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
