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

// Mock data — reemplaza con datos reales de tu backend
export const mockCropSeasons = [
  {
    id: "2025-26",
    name: "Campaña 2025–26",
    startDate: "2025-10-01",
    endDate: "2026-09-30",
    status: "active" as const,
    balance: null,
  },
  {
    id: "2024-25",
    name: "Campaña 2024–25",
    startDate: "2024-10-01",
    endDate: "2025-09-30",
    status: "closed" as const,
    balance: 29540,
  },
  {
    id: "2023-24",
    name: "Campaña 2023–24",
    startDate: "2023-10-01",
    endDate: "2024-09-30",
    status: "closed" as const,
    balance: 24900,
  },
  {
    id: "2022-23",
    name: "Campaña 2022–23",
    startDate: "2022-10-01",
    endDate: "2023-09-30",
    status: "closed" as const,
    balance: -3100,
  },
]

export type CropSeason = (typeof mockCropSeasons)[number]

function formatBalance(balance: number | null): string {
  if (balance === null) return "—"
  const formatted = Math.abs(balance).toLocaleString("es-ES")
  return balance >= 0 ? `+${formatted} €` : `-${formatted} €`
}

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
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

interface CropSeasonSwitcherProps {
  cropSeasons?: CropSeason[]
}

export function CropSeasonSwitcher({
  cropSeasons = mockCropSeasons,
}: CropSeasonSwitcherProps) {
  const isMobile = useIsMobile()

  const defaultCropSeason =
    cropSeasons.find((c) => c.status === "active") ?? cropSeasons[0]
  const [activeCropSeason, setActiveCropSeason] = React.useState<CropSeason>(
    defaultCropSeason!
  )

  if (!activeCropSeason) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <CircleIcon
            className={cn("size-2 shrink-0 fill-current", {
              "text-emerald-500": activeCropSeason.status === "active",
              "text-muted-foreground/50": activeCropSeason.status === "closed",
            })}
          />
          <span className="max-w-36 truncate text-xs font-medium sm:text-sm">
            {activeCropSeason.name}
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

        {cropSeasons.map((cropSeason) => {
          const cfg = statusConfig[cropSeason.status]
          const isActive = activeCropSeason.id === cropSeason.id
          const balancePositive =
            cropSeason.balance !== null && cropSeason.balance >= 0

          return (
            <DropdownMenuItem
              key={cropSeason.id}
              onClick={() => setActiveCropSeason(cropSeason)}
              className={cn("cursor-pointer gap-3 p-2.5", {
                "bg-accent": isActive,
              })}
            >
              {/* Dot de estado */}
              <div className="flex size-6 shrink-0 items-center justify-center">
                <div className={cn("size-2 rounded-full", cfg.color)} />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {cropSeason.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateRange(cropSeason.startDate, cropSeason.endDate)}
                </span>
              </div>

              {/* Balance + badge */}
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn("text-xs font-medium", {
                    "text-emerald-600": balancePositive,
                    "text-red-600":
                      cropSeason.balance !== null && !balancePositive,
                    "text-muted-foreground": cropSeason.balance === null,
                  })}
                >
                  {formatBalance(cropSeason.balance)}
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

        {/* Rango personalizado */}
        <div className="p-2.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" />
            Rango personalizado
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              defaultValue="2024-01-01"
              className="flex-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="shrink-0 text-xs text-muted-foreground">→</span>
            <Input
              type="date"
              defaultValue="2024-12-31"
              className="flex-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <Button
            className="mt-2 w-full rounded-md border border-border bg-muted py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            Aplicar rango
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
