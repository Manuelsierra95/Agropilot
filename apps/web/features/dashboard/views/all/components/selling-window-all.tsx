"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import type { DashboardSellingWindow } from "@workspace/schemas"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

import { RegisterSaleModal } from "@workspace/web/features/dashboard/components/register-sale-modal"
import {
  getSellingWindowSignal,
  SELLING_WINDOW_SIGNAL_CONFIG,
} from "@workspace/web/features/dashboard/components/selling-window-utils"

export type ParcelSellingWindowItem = {
  parcelId: string
  name: string
} & DashboardSellingWindow

type SellingWindowAllProps = {
  className?: string
  items: ParcelSellingWindowItem[]
}

const SIGNAL_ICON = {
  favorable: ArrowUpRight,
  neutral: Minus,
  unfavorable: ArrowDownRight,
}

function formatEur(value: number) {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}

export function SellingWindowAll({ className, items }: SellingWindowAllProps) {
  const [selectedItem, setSelectedItem] =
    React.useState<ParcelSellingWindowItem | null>(null)
  const modalOpen = selectedItem !== null

  const totalRevenue = items.reduce(
    (sum, item) => sum + item.lonjaPrice * item.estimatedKg,
    0
  )
  const totalKg = items.reduce((sum, item) => sum + item.estimatedKg, 0)

  return (
    <>
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden bg-background ring-0",
          className
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium tracking-tight">
                Ventana de venta
              </CardTitle>
              <CardDescription className="text-xs">
                Ingreso potencial por parcela
              </CardDescription>
            </div>
            {items.length > 0 && (
              <div className="text-right">
                <p className="text-base font-medium tracking-tight tabular-nums">
                  {formatEur(totalRevenue)}
                </p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {totalKg.toLocaleString("es-ES")} kg
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0 pb-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin datos de parcelas.
            </p>
          ) : (
            <ScrollArea className="-mr-2 max-h-[320px] pr-2 md:max-h-[240px]">
              <ul className="flex flex-col">
                {items.map((item, index) => {
                  const margin = item.lonjaPrice - item.costPerKg
                  const signal = getSellingWindowSignal(margin)
                  const config = SELLING_WINDOW_SIGNAL_CONFIG[signal]
                  const SignalIcon = SIGNAL_ICON[signal]
                  const potentialRevenue = item.lonjaPrice * item.estimatedKg
                  const marginPct =
                    item.costPerKg > 0 ? (margin / item.costPerKg) * 100 : 0

                  return (
                    <li key={item.parcelId}>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "group flex w-full items-center gap-4 py-3 pr-1 text-left transition-colors",
                          "hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-hidden",
                          index !== items.length - 1 &&
                            "border-b border-border/40"
                        )}
                      >
                        <SignalIcon
                          className={cn(
                            "size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                            config.color
                          )}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {item.estimatedKg.toLocaleString("es-ES")} kg
                          </p>
                        </div>

                        <div className="hidden shrink-0 flex-col items-end sm:flex">
                          <p className="text-sm font-medium text-foreground tabular-nums">
                            {formatEur(potentialRevenue)}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {item.lonjaPrice.toFixed(2)} €/kg
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5 pl-2">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              signal === "favorable"
                                ? "bg-(--primary-income)"
                                : signal === "unfavorable"
                                  ? "bg-(--primary-expense)"
                                  : "bg-amber-500"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-medium tabular-nums",
                              config.color
                            )}
                          >
                            {marginPct >= 0 ? "+" : ""}
                            {marginPct.toFixed(0)}%
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          )}

          {items.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground">
                Total estimado · {items.length} parcelas
              </span>
              <span className="text-base font-medium tracking-tight tabular-nums">
                {formatEur(totalRevenue)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <RegisterSaleModal
          open={modalOpen}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null)
          }}
          parcelName={selectedItem.name}
          parcelId={selectedItem.parcelId}
          lonjaPrice={selectedItem.lonjaPrice}
          costPerKg={selectedItem.costPerKg}
          lastSalePrice={selectedItem.lastSalePrice}
          campaignTarget={selectedItem.campaignTarget}
        />
      )}
    </>
  )
}
