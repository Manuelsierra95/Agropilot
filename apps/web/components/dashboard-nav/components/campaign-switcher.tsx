"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ChevronsUpDownIcon, CalendarIcon, CircleIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import type { CampaignListItem } from "@workspace/schemas"
import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import { useDashboardScopeActions } from "@/hooks/use-dashboard-scope-actions"
import { CampaignSwitcherPlaceholder } from "@/components/dashboard-nav/components/switcher-placeholders"
import {
  selectCampaignsForParcel,
  selectHasLoadedCampaignsForParcel,
  selectIsLoadingCampaigns,
  useDashboardListsStore,
} from "@/store/useDashboardListsStore"

function formatBalance(balance: number | null): string {
  if (balance === null) return "—"
  const formatted = Math.abs(balance).toLocaleString("es-ES")
  return balance >= 0 ? `+${formatted} €` : `-${formatted} €`
}

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
    })
  return `${fmt(startDate)} – ${fmt(endDate)}`
}

const statusConfig = {
  active: {
    label: "Activa",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  closed: {
    label: "Cerrada",
    color: "bg-muted-foreground/40",
    textColor: "text-muted-foreground",
    bgColor: "bg-muted",
  },
}

export function CampaignSwitcher() {
  const isMobile = useIsMobile()
  const [{ parcelId, campaignId, from, to }] = useDashboardScopeParams()
  const { selectCampaign, selectDateRange } = useDashboardScopeActions()
  const campaigns = useDashboardListsStore((state) =>
    selectCampaignsForParcel(state, parcelId)
  )
  const isLoading = useDashboardListsStore((state) =>
    selectIsLoadingCampaigns(state, parcelId)
  )
  const hasLoadedCampaigns = useDashboardListsStore((state) =>
    selectHasLoadedCampaignsForParcel(state, parcelId)
  )
  const isPendingCampaigns =
    Boolean(parcelId) && !hasLoadedCampaigns && !from && !to

  const [customFrom, setCustomFrom] = React.useState(from ?? "")
  const [customTo, setCustomTo] = React.useState(to ?? "")

  React.useEffect(() => {
    setCustomFrom(from ?? "")
    setCustomTo(to ?? "")
  }, [from, to])

  const activeCampaign =
    from && to
      ? ({
          id: "custom-range",
          name: "Rango personalizado",
          startDate: from,
          endDate: to,
          status: "active",
          balance: null,
        } satisfies CampaignListItem)
      : (campaigns.find((campaign) => campaign.id === campaignId) ??
        campaigns.find((campaign) => campaign.status === "active") ??
        campaigns[0])

  if (!activeCampaign) {
    if (isLoading || isPendingCampaigns) {
      return <CampaignSwitcherPlaceholder />
    }
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <CircleIcon
            className={cn("size-2 shrink-0 fill-current", {
              "text-emerald-500": activeCampaign.status === "active",
              "text-muted-foreground/50": activeCampaign.status === "closed",
            })}
          />
          <span className="max-w-36 truncate text-xs font-medium sm:text-sm">
            {activeCampaign.name}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-80 rounded-lg"
        align="end"
        side="bottom"
        sideOffset={isMobile ? 9 : 6}
      >
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Campañas
        </DropdownMenuLabel>

        {campaigns.map((campaign) => {
          const cfg = statusConfig[campaign.status]
          const isActive =
            !from && !to && activeCampaign.id === campaign.id
          const balancePositive =
            campaign.balance !== null && campaign.balance >= 0

          return (
            <DropdownMenuItem
              key={campaign.id}
              onClick={() => void selectCampaign(campaign.id)}
              className={cn("cursor-pointer gap-3 p-2.5", {
                "bg-accent": isActive,
              })}
            >
              <div className="flex size-6 shrink-0 items-center justify-center">
                <div className={cn("size-2 rounded-full", cfg.color)} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {campaign.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateRange(campaign.startDate, campaign.endDate)}
                </span>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn("text-xs font-medium", {
                    "text-emerald-600": balancePositive,
                    "text-red-600":
                      campaign.balance !== null && !balancePositive,
                    "text-muted-foreground": campaign.balance === null,
                  })}
                >
                  {formatBalance(campaign.balance)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    cfg.bgColor,
                    cfg.textColor
                  )}
                >
                  {cfg.label}
                </span>
              </div>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <div className="p-2.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" />
            Rango personalizado
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="flex-1 text-xs"
              onClick={(event) => event.stopPropagation()}
            />
            <span className="shrink-0 text-xs text-muted-foreground">→</span>
            <Input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="flex-1 text-xs"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <Button
            className="mt-2 w-full rounded-md border border-border bg-muted py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
            onClick={(event) => {
              event.stopPropagation()
              if (customFrom && customTo) {
                void selectDateRange(customFrom, customTo)
              }
            }}
          >
            Aplicar rango
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
