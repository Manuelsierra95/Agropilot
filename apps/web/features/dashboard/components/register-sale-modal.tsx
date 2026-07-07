"use client"

import * as React from "react"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Target,
  Coins,
  Wheat,
  Store,
  Package,
} from "lucide-react"

import {
  getSellingWindowSignal,
  SELLING_WINDOW_SIGNAL_CONFIG,
  type WindowSignal,
} from "@workspace/web/features/dashboard/components/selling-window-utils"
import {
  useCreateHarvestSale,
  useHarvestDeliveries,
} from "@workspace/web/hooks/production"
import type { HarvestSaleItemCreateInput } from "@workspace/schemas"

type RegisterSaleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lonjaPrice: number
  costPerKg: number
  lastSalePrice?: number
  campaignTarget?: number
  parcelName?: string
  parcelId?: string
  onConfirm?: () => void
}

const SIGNAL_ICON: Record<
  WindowSignal,
  React.ComponentType<{ className?: string }>
> = {
  favorable: TrendingUp,
  neutral: Minus,
  unfavorable: TrendingDown,
}

function formatEur(value: number) {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}

function formatEurExact(value: number) {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatQty(value: number) {
  return value.toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  })
}

export function RegisterSaleModal({
  open,
  onOpenChange,
  lonjaPrice,
  costPerKg,
  lastSalePrice,
  campaignTarget,
  parcelName,
  parcelId,
  onConfirm,
}: RegisterSaleModalProps) {
  const isMobile = useIsMobile()

  const [pricePerUnit, setPricePerUnit] = React.useState(lonjaPrice)
  const [buyerName, setBuyerName] = React.useState("")
  const [selectedItems, setSelectedItems] = React.useState<Map<string, number>>(
    new Map()
  )

  const { data: deliveries, isLoading: isLoadingDeliveries } =
    useHarvestDeliveries({
      parcelId: parcelId ?? "",
      status: "stored,partial",
    })

  const { mutate: createHarvestSale, isPending: isSubmitting } =
    useCreateHarvestSale()

  const availableDeliveries = React.useMemo(() => {
    return (deliveries ?? []).filter((d) => d.quantityRemaining > 0)
  }, [deliveries])

  const selectedDeliveries = React.useMemo(() => {
    return availableDeliveries
      .filter((d) => selectedItems.has(d.id))
      .map((d) => ({
        delivery: d,
        quantitySold: selectedItems.get(d.id) ?? 0,
      }))
  }, [availableDeliveries, selectedItems])

  const totalQuantitySold = selectedDeliveries.reduce(
    (sum, item) => sum + item.quantitySold,
    0
  )

  const margin = pricePerUnit - costPerKg
  const marginPct = costPerKg > 0 ? (margin / costPerKg) * 100 : 0
  const signal = getSellingWindowSignal(margin)
  const config = SELLING_WINDOW_SIGNAL_CONFIG[signal]
  const SignalIcon = SIGNAL_ICON[signal]

  const grossRevenue = pricePerUnit * totalQuantitySold
  const totalCost = costPerKg * totalQuantitySold
  const netProfit = grossRevenue - totalCost

  const costRatio = grossRevenue > 0 ? (totalCost / grossRevenue) * 100 : 0
  const profitRatio =
    grossRevenue > 0
      ? Math.min(Math.abs((netProfit / grossRevenue) * 100), 100 - costRatio)
      : 0

  const vsLastSale = lastSalePrice
    ? ((pricePerUnit - lastSalePrice) / lastSalePrice) * 100
    : null

  const activeTarget =
    campaignTarget && campaignTarget > 0 ? campaignTarget : null
  const targetProgress =
    activeTarget && activeTarget > 0
      ? Math.min((pricePerUnit / activeTarget) * 100, 100)
      : null
  const targetGap = activeTarget ? pricePerUnit - activeTarget : null

  const handleToggleDelivery = (deliveryId: string, maxQty: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      if (next.has(deliveryId)) {
        next.delete(deliveryId)
      } else {
        next.set(deliveryId, maxQty)
      }
      return next
    })
  }

  const handleToggleAllDeliveries = (selectAll: boolean) => {
    if (!selectAll) {
      setSelectedItems(new Map())
      return
    }

    setSelectedItems(
      new Map(
        availableDeliveries.map((delivery) => [
          delivery.id,
          delivery.quantityRemaining,
        ])
      )
    )
  }

  const handleQuantityChange = (
    deliveryId: string,
    value: number,
    maxQty: number
  ) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      next.set(deliveryId, Math.min(Math.max(value, 0), maxQty))
      return next
    })
  }

  const handleConfirm = () => {
    if (
      !parcelId ||
      selectedDeliveries.length === 0 ||
      totalQuantitySold <= 0
    ) {
      return
    }

    const deliveriesInput: HarvestSaleItemCreateInput[] =
      selectedDeliveries.map((item) => ({
        deliveryId: item.delivery.id,
        quantitySold: Number(item.quantitySold.toFixed(2)),
      }))

    createHarvestSale(
      {
        parcelId,
        saleDate: new Date().toISOString().slice(0, 10),
        pricePerUnit,
        deliveries: deliveriesInput,
        buyerName: buyerName.trim() || undefined,
      },
      {
        onSuccess: () => {
          onConfirm?.()
          onOpenChange(false)
        },
      }
    )
  }

  const content = (
    <>
      <ModalHeader
        parcelName={parcelName}
        config={config}
        SignalIcon={SignalIcon}
        signal={signal}
        marginPct={marginPct}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2">
        <PriceGrid
          lonjaPrice={lonjaPrice}
          costPerKg={costPerKg}
          margin={margin}
          marginPct={marginPct}
          signal={signal}
          pricePerUnit={pricePerUnit}
        />

        <DeliverySelection
          deliveries={availableDeliveries}
          selectedItems={selectedItems}
          isLoading={isLoadingDeliveries}
          onToggle={handleToggleDelivery}
          onToggleAll={handleToggleAllDeliveries}
          onQuantityChange={handleQuantityChange}
        />

        <SaleConfiguration
          pricePerUnit={pricePerUnit}
          onPricePerUnitChange={setPricePerUnit}
          buyerName={buyerName}
          onBuyerNameChange={setBuyerName}
        />

        <RevenueBreakdown
          grossRevenue={grossRevenue}
          totalCost={totalCost}
          netProfit={netProfit}
          totalQuantitySold={totalQuantitySold}
          costRatio={costRatio}
          profitRatio={profitRatio}
          signal={signal}
        />

        {(vsLastSale !== null || targetProgress !== null) && (
          <>
            <Separator />
            <ContextSection
              vsLastSale={vsLastSale}
              lastSalePrice={lastSalePrice}
              targetProgress={targetProgress}
              targetGap={targetGap}
              campaignTarget={activeTarget ?? undefined}
              pricePerUnit={pricePerUnit}
            />
          </>
        )}
      </div>

      <ModalFooter
        isMobile={isMobile}
        isSubmitting={isSubmitting}
        canSubmit={
          selectedDeliveries.length > 0 &&
          totalQuantitySold > 0 &&
          !isLoadingDeliveries
        }
        onConfirm={handleConfirm}
      />
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex max-h-[90vh] flex-col">
          <DrawerHeader className="gap-0 pb-2 text-left">
            <DrawerTitle className="sr-only">
              Confirmar venta{parcelName ? ` — ${parcelName}` : ""}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Vista previa de la venta de aceite de oliva
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex min-w-[620px] flex-col sm:max-w-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            Confirmar venta{parcelName ? ` — ${parcelName}` : ""}
          </SheetTitle>
          <SheetDescription>
            Vista previa de la venta de aceite de oliva
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  )
}

function ModalHeader({
  parcelName,
  config,
  SignalIcon,
  signal,
  marginPct,
}: {
  parcelName?: string
  config: (typeof SELLING_WINDOW_SIGNAL_CONFIG)[WindowSignal]
  SignalIcon: React.ComponentType<{ className?: string }>
  signal: WindowSignal
  marginPct: number
}) {
  const signalLabel =
    signal === "favorable"
      ? "Ventana de venta favorable"
      : signal === "neutral"
        ? "Margen ajustado — valorar esperar"
        : "Por debajo del umbral de rentabilidad"

  return (
    <div className={cn("rounded-xl p-4")}>
      <div className="flex items-center gap-1">
        {parcelName && (
          <p className="truncate text-sm font-semibold text-foreground">
            {parcelName}
          </p>
        )}
        <div className="flex items-center justify-center gap-2">
          <SignalIcon className={cn("size-4 shrink-0", config.color)} />
          <p className={cn("text-sm font-medium", config.color)}>
            {signalLabel}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={cn("text-xs font-semibold tabular-nums", config.color)}
        >
          {marginPct >= 0 ? "+" : ""}
          {marginPct.toFixed(0)}% margen
        </Badge>
      </div>
    </div>
  )
}

function PriceGrid({
  lonjaPrice,
  costPerKg,
  margin,
  marginPct,
  signal,
  pricePerUnit,
}: {
  lonjaPrice: number
  costPerKg: number
  margin: number
  marginPct: number
  signal: WindowSignal
  pricePerUnit: number
}) {
  const color = SELLING_WINDOW_SIGNAL_CONFIG[signal].color

  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        icon={Scale}
        label="Precio lonja"
        value={formatEurExact(lonjaPrice)}
        iconClassName="text-sky-500"
      />
      <MetricCard
        icon={Coins}
        label="Tu coste"
        value={formatEurExact(costPerKg)}
        iconClassName="text-orange-500"
      />
      <MetricCard
        icon={
          signal === "favorable"
            ? TrendingUp
            : signal === "unfavorable"
              ? TrendingDown
              : Minus
        }
        label="Margen"
        value={`${marginPct >= 0 ? "+" : ""}${marginPct.toFixed(1)}%`}
        subtitle={`${margin >= 0 ? "+" : ""}${formatEurExact(margin)}/kg`}
        valueClassName={color}
        iconClassName={color}
      />
      <MetricCard
        icon={Store}
        label="Precio de venta"
        value={formatEurExact(pricePerUnit)}
        iconClassName="text-emerald-500"
      />
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  valueClassName,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtitle?: string
  valueClassName?: string
  iconClassName?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className={cn("size-3.5", iconClassName)} />
        <span className="text-[11px] font-medium text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-base font-semibold tracking-tight tabular-nums sm:text-lg",
          valueClassName
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className={cn("text-[11px] tabular-nums", valueClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function DeliverySelection({
  deliveries,
  selectedItems,
  isLoading,
  onToggle,
  onToggleAll,
  onQuantityChange,
}: {
  deliveries: Array<{
    id: string
    destinationName: string | null
    deliveryDate: string
    quantityRemaining: number
    processedUnit: string
    rawQuantity: number
    rawUnit: string
  }>
  selectedItems: Map<string, number>
  isLoading: boolean
  onToggle: (deliveryId: string, maxQty: number) => void
  onToggleAll: (selectAll: boolean) => void
  onQuantityChange: (deliveryId: string, value: number, maxQty: number) => void
}) {
  const selectedCount = deliveries.filter((delivery) =>
    selectedItems.has(delivery.id)
  ).length
  const allSelected =
    deliveries.length > 0 && selectedCount === deliveries.length
  const someSelected = selectedCount > 0 && !allSelected

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Entregas disponibles
          </p>
        </div>

        {deliveries.length > 0 && !isLoading ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id="delivery-select-all"
              checked={allSelected || (someSelected && "indeterminate")}
              onCheckedChange={(checked) => onToggleAll(checked === true)}
              aria-label="Seleccionar todas las entregas"
            />
            <Label
              htmlFor="delivery-select-all"
              className="cursor-pointer text-xs text-muted-foreground"
            >
              Seleccionar todas
            </Label>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="size-5" />
        </div>
      ) : deliveries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay entregas con stock disponible para esta parcela.
        </p>
      ) : (
        <ScrollArea className="max-h-72 overflow-hidden [&>[data-slot=scroll-area-viewport]]:max-h-72">
          <ul className="space-y-2 pr-3">
            {deliveries.map((delivery) => {
              const isSelected = selectedItems.has(delivery.id)
              const quantitySold = selectedItems.get(delivery.id) ?? 0

              return (
                <li
                  key={delivery.id}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    isSelected
                      ? "border-primary/30 bg-primary/5"
                      : "bg-background"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`delivery-${delivery.id}`}
                      checked={isSelected}
                      onCheckedChange={() =>
                        onToggle(delivery.id, delivery.quantityRemaining)
                      }
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <Label
                        htmlFor={`delivery-${delivery.id}`}
                        className="cursor-pointer text-sm font-medium"
                      >
                        {delivery.destinationName ?? "Entrega sin destino"}
                      </Label>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatQty(delivery.rawQuantity)} {delivery.rawUnit}{" "}
                        entregados · {delivery.deliveryDate}
                      </p>
                      <p className="text-xs text-foreground tabular-nums">
                        {formatQty(delivery.quantityRemaining)}{" "}
                        {delivery.processedUnit} disponibles
                      </p>

                      {isSelected && (
                        <div className="mt-2 flex items-center gap-2">
                          <Label
                            htmlFor={`qty-${delivery.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Cantidad
                          </Label>
                          <Input
                            id={`qty-${delivery.id}`}
                            type="number"
                            min={0}
                            max={delivery.quantityRemaining}
                            step="0.01"
                            value={quantitySold}
                            onChange={(event) => {
                              const value = Number(event.target.value)
                              if (Number.isFinite(value)) {
                                onQuantityChange(
                                  delivery.id,
                                  value,
                                  delivery.quantityRemaining
                                )
                              }
                            }}
                            className="h-7 w-24 text-right text-sm tabular-nums"
                          />
                          <span className="text-xs text-muted-foreground">
                            {delivery.processedUnit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}

function SaleConfiguration({
  pricePerUnit,
  onPricePerUnitChange,
  buyerName,
  onBuyerNameChange,
}: {
  pricePerUnit: number
  onPricePerUnitChange: (value: number) => void
  buyerName: string
  onBuyerNameChange: (value: string) => void
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase">
            Precio de venta
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={pricePerUnit}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (Number.isFinite(value)) {
                  onPricePerUnitChange(Math.max(value, 0))
                }
              }}
              className="h-7 w-24 text-right text-sm tabular-nums"
            />
            <span className="text-xs text-muted-foreground">€/unidad</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase">
            Comprador
          </Label>
          <Input
            type="text"
            value={buyerName}
            placeholder="Opcional"
            onChange={(event) => onBuyerNameChange(event.target.value)}
            className="h-7 w-48 text-right text-sm"
          />
        </div>
      </div>
    </div>
  )
}

function RevenueBreakdown({
  grossRevenue,
  totalCost,
  netProfit,
  totalQuantitySold,
  costRatio,
  profitRatio,
  signal,
}: {
  grossRevenue: number
  totalCost: number
  netProfit: number
  totalQuantitySold: number
  costRatio: number
  profitRatio: number
  signal: WindowSignal
}) {
  const profitColor = SELLING_WINDOW_SIGNAL_CONFIG[signal].color

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Wheat className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Proyección de venta
        </p>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {formatQty(totalQuantitySold)} unidades
        </span>
      </div>

      <div className="mb-3 flex h-3 overflow-hidden rounded-full">
        <div
          className="bg-orange-400/70 transition-all duration-500"
          style={{ width: `${costRatio}%` }}
        />
        <div
          className={cn(
            "transition-all duration-500",
            netProfit >= 0 ? "bg-(--primary-income)" : "bg-(--primary-expense)"
          )}
          style={{ width: `${profitRatio}%` }}
        />
      </div>

      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-orange-400/70" />
          <span className="text-[11px] text-muted-foreground">Costes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-2 rounded-full",
              netProfit >= 0
                ? "bg-(--primary-income)"
                : "bg-(--primary-expense)"
            )}
          />
          <span className="text-[11px] text-muted-foreground">
            {netProfit >= 0 ? "Beneficio" : "Pérdida"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-muted-foreground">Bruto</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatEur(grossRevenue)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-muted-foreground">Costes</span>
          <span className="text-sm font-semibold text-orange-500 tabular-nums">
            {formatEur(totalCost)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-muted-foreground">Beneficio</span>
          <span
            className={cn("text-sm font-semibold tabular-nums", profitColor)}
          >
            {netProfit >= 0 ? "+" : ""}
            {formatEur(netProfit)}
          </span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Ingreso neto estimado
        </span>
        <span
          className={cn(
            "text-xl font-bold tracking-tight tabular-nums",
            profitColor
          )}
        >
          {netProfit >= 0 ? "+" : ""}
          {formatEur(netProfit)}
        </span>
      </div>
    </div>
  )
}

function ContextSection({
  vsLastSale,
  lastSalePrice,
  targetProgress,
  targetGap,
  campaignTarget,
  pricePerUnit,
}: {
  vsLastSale: number | null
  lastSalePrice?: number
  targetProgress: number | null
  targetGap: number | null
  campaignTarget?: number
  pricePerUnit: number
}) {
  return (
    <div className="flex flex-col gap-3">
      {vsLastSale !== null && lastSalePrice !== undefined && (
        <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                vsLastSale >= 0
                  ? "bg-(--primary-income)/10"
                  : "bg-(--primary-expense)/10"
              )}
            >
              {vsLastSale >= 0 ? (
                <TrendingUp className="size-3.5 text-(--primary-income)" />
              ) : (
                <TrendingDown className="size-3.5 text-(--primary-expense)" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium">vs último precio</p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {formatEurExact(lastSalePrice)}/kg
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              vsLastSale >= 0
                ? "text-(--primary-income)"
                : "text-(--primary-expense)"
            )}
          >
            {vsLastSale >= 0 ? "+" : ""}
            {vsLastSale.toFixed(1)}%
          </span>
        </div>
      )}

      {targetProgress !== null &&
        campaignTarget !== undefined &&
        targetGap !== null && (
          <div className="rounded-lg bg-muted/20 px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full",
                    targetGap >= 0
                      ? "bg-(--primary-income)/10"
                      : "bg-amber-500/10"
                  )}
                >
                  <Target
                    className={cn(
                      "size-3.5",
                      targetGap >= 0
                        ? "text-(--primary-income)"
                        : "text-amber-500"
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium">Objetivo campaña</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {formatEurExact(campaignTarget)}/kg
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  targetGap >= 0 ? "text-(--primary-income)" : "text-amber-500"
                )}
              >
                {targetGap >= 0
                  ? "Superado"
                  : `-${formatEurExact(Math.abs(targetGap))}/kg`}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "transition-all duration-500",
                  targetGap >= 0 ? "bg-(--primary-income)" : "bg-amber-500"
                )}
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-[11px] text-muted-foreground tabular-nums">
              {pricePerUnit.toFixed(2)} / {campaignTarget.toFixed(2)} €/kg
            </p>
          </div>
        )}
    </div>
  )
}

function ModalFooter({
  isMobile,
  isSubmitting,
  canSubmit,
  onConfirm,
}: {
  isMobile: boolean
  isSubmitting: boolean
  canSubmit: boolean
  onConfirm: () => void
}) {
  const buttonContent = isSubmitting ? (
    <>
      <Spinner className="size-3.5" />
      Registrando...
    </>
  ) : (
    "Confirmar venta"
  )

  if (isMobile) {
    return (
      <DrawerFooter className="flex flex-row gap-2">
        <DrawerClose asChild>
          <Button variant="outline" className="flex-1" disabled={isSubmitting}>
            Cancelar
          </Button>
        </DrawerClose>
        <Button
          onClick={onConfirm}
          className="flex-1 gap-2"
          disabled={!canSubmit || isSubmitting}
        >
          {buttonContent}
        </Button>
      </DrawerFooter>
    )
  }

  return (
    <SheetFooter className="flex flex-row gap-2">
      <SheetClose asChild>
        <Button variant="outline" className="flex-1" disabled={isSubmitting}>
          Cancelar
        </Button>
      </SheetClose>
      <Button
        onClick={onConfirm}
        className="flex-1 gap-2"
        disabled={!canSubmit || isSubmitting}
      >
        {buttonContent}
      </Button>
    </SheetFooter>
  )
}
