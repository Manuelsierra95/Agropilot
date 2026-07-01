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
import { ChevronsUpDownIcon, LayersIcon, PlusIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import { useDashboardScopeActions } from "@workspace/web/hooks/use-dashboard-scope-actions"
import { useDashboardListsStore } from "@workspace/web/store/useDashboardListsStore"
import { ParcelSwitcherPlaceholder } from "@workspace/web/components/dashboard-nav/components/switcher-placeholders"
import { getParcelIcon } from "@workspace/web/lib/navigation/parcel-icon"
import { CreateParcelDialog } from "@workspace/web/components/parcel/create-parcel-dialog"

interface ParcelSwitcherProps {
  variant?: "sidebar" | "dock"
}

const ALL_PARCELS_LABEL = "Todas las parcelas"

export function ParcelSwitcher({ variant = "sidebar" }: ParcelSwitcherProps) {
  const isMobile = useIsMobile()
  const [{ parcelId }] = useDashboardScopeParams()
  const { selectAllParcels, selectParcel } = useDashboardScopeActions()
  const parcels = useDashboardListsStore((state) => state.parcels)
  const isLoading = useDashboardListsStore((state) => state.isLoadingParcels)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const isAllSelected = !parcelId
  const activeParcel = parcelId
    ? parcels.find((parcel) => parcel.id === parcelId)
    : undefined

  if (parcels.length === 0) {
    if (isLoading) {
      return <ParcelSwitcherPlaceholder variant={variant} />
    }
    return null
  }

  const ActiveIcon = isAllSelected
    ? LayersIcon
    : getParcelIcon(activeParcel?.cropType)
  const displayName = isAllSelected
    ? ALL_PARCELS_LABEL
    : (activeParcel?.name ?? parcels[0]!.name)
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
              {displayName}
            </span>
          ) : (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="max-w-36 truncate font-medium">
                {displayName}
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
        <DropdownMenuItem
          onClick={() => void selectAllParcels()}
          className="gap-2 p-2"
        >
          <div className="flex size-6 items-center justify-center rounded-md border">
            <LayersIcon className="size-4" />
          </div>
          {ALL_PARCELS_LABEL}
          <DropdownMenuShortcut>⌘0</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
        <DropdownMenuItem
          className="gap-2 p-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <PlusIcon className="size-4" />
          </div>
          <span className="font-medium text-muted-foreground">
            Crear parcela
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <CreateParcelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </DropdownMenu>
  )
}
