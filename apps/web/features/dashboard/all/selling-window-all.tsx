"use client"

import { Badge } from "@workspace/ui/components/badge"
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

import {
  getSellingWindowSignal,
  SELLING_WINDOW_SIGNAL_CONFIG,
} from "@workspace/web/features/dashboard/selling-window-utils"

export type ParcelSellingWindowItem = {
  parcelId: string
  name: string
} & DashboardSellingWindow

type SellingWindowAllProps = {
  className?: string
  items: ParcelSellingWindowItem[]
}

export function SellingWindowAll({ className, items }: SellingWindowAllProps) {
  return (
    <Card className={cn("overflow-hidden bg-background ring-0", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ventana de venta</CardTitle>
        <CardDescription className="text-xs">
          Ingreso potencial y señal por parcela
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin datos de parcelas.</p>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <ul className="divide-y divide-border/40 pb-1 pr-3">
              {items.map((item) => {
                const margin = item.lonjaPrice - item.costPerKg
                const signal = getSellingWindowSignal(margin)
                const config = SELLING_WINDOW_SIGNAL_CONFIG[signal]
                const potentialRevenue = item.lonjaPrice * item.estimatedKg

                return (
                  <li
                    key={item.parcelId}
                    className="flex flex-row items-center gap-3 py-2.5"
                  >
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {item.estimatedKg.toLocaleString("es-ES")} kg
                    </p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {potentialRevenue.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <Badge
                      variant={config.badgeVariant}
                      className={cn(
                        "shrink-0 text-[10px]",
                        config.bg,
                        config.color
                      )}
                    >
                      {config.label}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
