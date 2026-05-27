"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SellingWindowProps {
  className?: string
  lonjaPrice: number
  costPerKg: number
  lastSalePrice?: number
  estimatedKg: number
  campaignTarget?: number
}

type WindowSignal = "favorable" | "neutral" | "unfavorable"

function getSignal(margin: number): WindowSignal {
  if (margin >= 0.8) return "favorable"
  if (margin >= 0.3) return "neutral"
  return "unfavorable"
}

const SIGNAL_CONFIG = {
  favorable: {
    label: "Ventana de venta favorable",
    color: "text-(--primary-income)",
    badgeVariant: "default" as const,
    bg: "bg-(--primary-income)/10",
    Icon: TrendingUp,
  },
  neutral: {
    label: "Margen ajustado — valorar esperar",
    color: "text-amber-500",
    badgeVariant: "secondary" as const,
    bg: "bg-amber-500/10",
    Icon: Minus,
  },
  unfavorable: {
    label: "Por debajo del umbral de rentabilidad",
    color: "text-(--primary-expense)",
    badgeVariant: "destructive" as const,
    bg: "bg-(--primary-expense)/10",
    Icon: TrendingDown,
  },
}

export function SellingWindow({
  className,
  lonjaPrice,
  costPerKg,
  lastSalePrice,
  estimatedKg,
  campaignTarget,
}: SellingWindowProps) {
  const margin = lonjaPrice - costPerKg
  const marginPct = costPerKg > 0 ? (margin / costPerKg) * 100 : 0
  const signal = getSignal(margin)
  const { label, color, bg, badgeVariant, Icon } = SIGNAL_CONFIG[signal]
  const potentialRevenue = lonjaPrice * estimatedKg
  const vsLastSale = lastSalePrice
    ? ((lonjaPrice - lastSalePrice) / lastSalePrice) * 100
    : null

  return (
    <Card className={cn("overflow-hidden bg-background ring-0", className)}>
      <CardHeader className="pb-3">
        <div className={cn("rounded-lg p-3", bg)}>
          <p className={cn("text-sm font-medium", color)}>{label}</p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Price Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">
              Precio lonja
            </p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {lonjaPrice.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                €/kg
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Tu coste</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {costPerKg.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                €/kg
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Margen</p>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums",
                color
              )}
            >
              {marginPct >= 0 ? "+" : ""}
              {marginPct.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-border" />

        {/* Potential Revenue */}
        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ingreso potencial
              </p>
              <p className="text-xs text-muted-foreground/70">
                {estimatedKg.toLocaleString("es-ES")} kg disponibles
              </p>
            </div>
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              {potentialRevenue.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* Comparisons */}
        {(vsLastSale !== null || campaignTarget) && (
          <div className="mt-4 space-y-2">
            {vsLastSale !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  vs. último precio ({lastSalePrice?.toFixed(2)} €/kg)
                </span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    vsLastSale >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {vsLastSale >= 0 ? "+" : ""}
                  {vsLastSale.toFixed(1)}%
                </span>
              </div>
            )}

            {campaignTarget && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  vs. objetivo ({campaignTarget.toFixed(2)} €/kg)
                </span>
                <span
                  className={cn(
                    "font-medium",
                    lonjaPrice >= campaignTarget
                      ? "text-emerald-500"
                      : "text-red-500"
                  )}
                >
                  {lonjaPrice >= campaignTarget
                    ? "Superado"
                    : `-${(campaignTarget - lonjaPrice).toFixed(2)} €/kg`}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-center border-0 bg-background px-4 pt-0">
        <Button
          className="w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
          size="sm"
          variant="outline"
        >
          Registrar venta
        </Button>
      </CardFooter>
    </Card>
  )
}
