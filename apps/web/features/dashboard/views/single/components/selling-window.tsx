"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { CampaignTargetComparison } from "@workspace/web/features/dashboard/components/campaign-target-comparison"
import { RegisterHarvestDeliveryModal } from "@workspace/web/features/dashboard/components/register-harvest-delivery-modal"
import { RegisterSaleModal } from "@workspace/web/features/dashboard/components/register-sale-modal"

import {
  getSellingWindowSignal,
  SELLING_WINDOW_SIGNAL_CONFIG,
} from "@workspace/web/features/dashboard/components/selling-window-utils"

interface SellingWindowProps {
  className?: string
  lonjaPrice: number
  costPerKg: number
  lastSalePrice?: number
  estimatedKg: number
  campaignTarget?: number
  parcelId?: string
}

type WindowSignal = "favorable" | "neutral" | "unfavorable"

function getSignal(margin: number): WindowSignal {
  return getSellingWindowSignal(margin)
}

const SIGNAL_CONFIG = {
  favorable: {
    ...SELLING_WINDOW_SIGNAL_CONFIG.favorable,
    label: "Ventana de venta favorable",
    Icon: TrendingUp,
  },
  neutral: {
    ...SELLING_WINDOW_SIGNAL_CONFIG.neutral,
    label: "Margen ajustado — valorar esperar",
    Icon: Minus,
  },
  unfavorable: {
    ...SELLING_WINDOW_SIGNAL_CONFIG.unfavorable,
    label: "Por debajo del umbral de rentabilidad",
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
  parcelId,
}: SellingWindowProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalKey, setModalKey] = React.useState(0)
  const [harvestModalOpen, setHarvestModalOpen] = React.useState(false)
  const [harvestModalKey, setHarvestModalKey] = React.useState(0)

  const handleOpenModal = React.useCallback(() => {
    setModalKey((k) => k + 1)
    setModalOpen(true)
  }, [])

  const handleOpenHarvestModal = React.useCallback(() => {
    setHarvestModalKey((k) => k + 1)
    setHarvestModalOpen(true)
  }, [])

  const margin = lonjaPrice - costPerKg
  const marginPct = costPerKg > 0 ? (margin / costPerKg) * 100 : 0
  const signal = getSignal(margin)
  const { label, color, bg } = SIGNAL_CONFIG[signal]
  const potentialRevenue = lonjaPrice * estimatedKg
  const vsLastSale = lastSalePrice
    ? ((lonjaPrice - lastSalePrice) / lastSalePrice) * 100
    : null

  return (
    <>
      <Card className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-background ring-0", className)}>
        <CardHeader className="shrink-0 pb-2 sm:pb-3">
          <div className={cn("rounded-lg p-2 sm:p-3", bg)}>
            <p className={cn("text-xs font-medium sm:text-sm", color)}>
              {label}
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col justify-start overflow-y-auto">
          {/* Price Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="space-y-0 sm:space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase sm:text-xs">
                Precio
              </p>
              <p className="text-base font-semibold tracking-tight tabular-nums sm:text-2xl">
                {lonjaPrice.toFixed(2)}
                <span className="ml-0.5 text-[10px] font-normal text-muted-foreground sm:ml-1 sm:text-sm">
                  €/kg
                </span>
              </p>
            </div>
            <div className="space-y-0 sm:space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase sm:text-xs">
                Coste
              </p>
              <p className="text-base font-semibold tracking-tight tabular-nums sm:text-2xl">
                {costPerKg.toFixed(2)}
                <span className="ml-0.5 text-[10px] font-normal text-muted-foreground sm:ml-1 sm:text-sm">
                  €/kg
                </span>
              </p>
            </div>
            <div className="space-y-0 sm:space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase sm:text-xs">
                Margen
              </p>
              <p
                className={cn(
                  "text-base font-semibold tracking-tight tabular-nums sm:text-2xl",
                  color
                )}
              >
                {marginPct >= 0 ? "+" : ""}
                {marginPct.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-3 h-px shrink-0 bg-border sm:my-5" />

          {/* Potential Revenue */}
          <div className="shrink-0 rounded-lg bg-muted/50 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                  Ingreso potencial
                </p>
                <p className="text-[10px] text-muted-foreground/70 sm:text-xs">
                  {estimatedKg.toLocaleString("es-ES")} litros disponibles
                </p>
              </div>
              <p className="text-base font-semibold tracking-tight tabular-nums sm:text-xl">
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
            <div className="mt-2 shrink-0 space-y-1 sm:mt-4 sm:space-y-2">
              {vsLastSale !== null && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
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

              {campaignTarget !== undefined && (
                <CampaignTargetComparison
                  lonjaPrice={lonjaPrice}
                  campaignTarget={campaignTarget}
                />
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-auto grid shrink-0 grid-cols-2 gap-2 border-0 bg-background px-4 pt-2 pb-4">
          <Button
            className="w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
            size="sm"
            variant="outline"
            onClick={handleOpenHarvestModal}
          >
            Entrega
          </Button>
          <Button
            className="w-full gap-2 border-0 bg-muted-foreground/5 text-xs"
            size="sm"
            variant="outline"
            onClick={handleOpenModal}
          >
            Venta
          </Button>
        </CardFooter>
      </Card>

      <RegisterHarvestDeliveryModal
        key={harvestModalKey}
        open={harvestModalOpen}
        onOpenChange={setHarvestModalOpen}
        parcelId={parcelId}
      />

      <RegisterSaleModal
        key={modalKey}
        open={modalOpen}
        onOpenChange={setModalOpen}
        lonjaPrice={lonjaPrice}
        costPerKg={costPerKg}
        lastSalePrice={lastSalePrice}
        campaignTarget={campaignTarget}
        parcelId={parcelId}
      />
    </>
  )
}
