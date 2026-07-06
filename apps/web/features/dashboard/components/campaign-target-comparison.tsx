"use client"

import * as React from "react"
import { Pencil } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  useDashboardScope,
  useUpdateCampaignSaleTarget,
} from "@workspace/web/hooks/dashboard"

type CampaignTargetComparisonProps = {
  lonjaPrice: number
  campaignTarget: number
}

export function CampaignTargetComparison({
  lonjaPrice,
  campaignTarget,
}: CampaignTargetComparisonProps) {
  const scope = useDashboardScope()
  const { mutate: updateCampaignSaleTarget, isPending } =
    useUpdateCampaignSaleTarget()

  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(campaignTarget.toFixed(2))

  React.useEffect(() => {
    if (!open) {
      setDraft(campaignTarget.toFixed(2))
    }
  }, [campaignTarget, open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(campaignTarget.toFixed(2))
    }
    setOpen(nextOpen)
  }

  const handleSave = () => {
    const parcelId = scope.parcelId
    if (!parcelId) return

    const value = Number.parseFloat(draft.replace(",", "."))
    if (!Number.isFinite(value) || value <= 0) return

    updateCampaignSaleTarget(
      {
        parcelId,
        campaignTarget: value,
        campaignId: scope.campaignId ?? undefined,
        from: scope.from ?? undefined,
        to: scope.to ?? undefined,
      },
      {
        onSuccess: () => {
          setOpen(false)
        },
      }
    )
  }

  const gap = campaignTarget - lonjaPrice

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex min-w-0 items-center gap-0.5">
        <span className="truncate text-muted-foreground">
          vs. objetivo ({campaignTarget.toFixed(2)} €/kg)
        </span>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 gap-1 px-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Ajustar objetivo de venta"
              disabled={!scope.parcelId}
            >
              <Pencil className="size-3" />
              <span className="text-xs">Ajustar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 space-y-3 p-3">
            <div className="space-y-1.5">
              <Label htmlFor="campaign-target" className="text-xs">
                Objetivo de venta (€/kg)
              </Label>
              <Input
                id="campaign-target"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="h-8 text-sm tabular-nums"
                value={draft}
                disabled={isPending}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleSave()
                  }
                }}
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="h-7 w-full text-xs"
              disabled={isPending}
              onClick={handleSave}
            >
              {isPending ? (
                <>
                  <Spinner className="size-3" />
                  Guardando...
                </>
              ) : (
                "Guardar objetivo"
              )}
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <span
        className={cn(
          "shrink-0 font-medium",
          lonjaPrice >= campaignTarget ? "text-emerald-500" : "text-red-500"
        )}
      >
        {lonjaPrice >= campaignTarget
          ? "Superado"
          : `-${gap.toFixed(2)} €/kg`}
      </span>
    </div>
  )
}
