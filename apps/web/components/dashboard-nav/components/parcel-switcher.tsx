"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import { useDashboardScopeActions } from "@/hooks/use-dashboard-scope-actions"
import { useDashboardListsStore } from "@/store/useDashboardListsStore"
import { ParcelSwitcherPlaceholder } from "@/components/dashboard-nav/components/switcher-placeholders"
import { getParcelIcon } from "@/lib/navigation/parcel-icon"

interface ParcelSwitcherProps {
  variant?: "sidebar" | "dock"
}

export function ParcelSwitcher({ variant = "sidebar" }: ParcelSwitcherProps) {
  const isMobile = useIsMobile()
  const [{ parcelId }] = useDashboardScopeParams()
  const { selectParcel } = useDashboardScopeActions()
  const parcels = useDashboardListsStore((state) => state.parcels)
  const isLoading = useDashboardListsStore((state) => state.isLoadingParcels)

  const activeParcel =
    parcels.find((parcel) => parcel.id === parcelId) ?? parcels[0]

  if (!activeParcel) {
    if (isLoading) {
      return <ParcelSwitcherPlaceholder variant={variant} />
    }
    return null
  }

  const ActiveIcon = getParcelIcon(activeParcel.cropType)
  const isDock = variant === "dock"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className={
            isDock
              ? "flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent"
              : "p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          }
        >
          <div className="flex size-6 items-center justify-center rounded-md border">
            <ActiveIcon className="size-4" />
          </div>
          {isDock ? (
            <span className="max-w-36 truncate text-xs font-medium sm:text-sm">
              {activeParcel.name}
            </span>
          ) : (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="max-w-36 truncate font-medium">
                {activeParcel.name}
              </span>
            </div>
          )}
          <ChevronsUpDownIcon
            className={
              isDock ? "size-3.5 shrink-0 text-muted-foreground" : "ml-auto"
            }
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={isMobile ? 9 : 6}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Parcels
        </DropdownMenuLabel>
        {parcels.map((parcel, index) => {
          const ParcelIcon = getParcelIcon(parcel.cropType)
          return (
            <DropdownMenuItem
              key={parcel.id}
              onClick={() => void selectParcel(parcel.id)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <ParcelIcon className="size-4" />
              </div>
              {parcel.name}
              <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <PlusIcon className="size-4" />
          </div>
          <span className="font-medium text-muted-foreground">Add parcel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
