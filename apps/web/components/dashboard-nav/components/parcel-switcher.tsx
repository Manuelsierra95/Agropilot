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
import type { NavigationParcel } from "@/lib/navigation/navigation-data"
import { getIcon } from "@/lib/icons"
import { Button } from "@workspace/ui/components/button"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

interface ParcelSwitcherProps {
  parcels: NavigationParcel[]
  variant?: "sidebar" | "dock"
}

export function ParcelSwitcher({
  parcels,
  variant = "sidebar",
}: ParcelSwitcherProps) {
  const isMobile = useIsMobile()
  const [activeParcel, setActiveParcel] = React.useState(parcels[0])
  if (!activeParcel) return null

  const ActiveIcon = getIcon(activeParcel.icon)
  const isDock = variant === "dock"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
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
          const ParcelIcon = getIcon(parcel.icon)
          return (
            <DropdownMenuItem
              key={parcel.name}
              onClick={() => setActiveParcel(parcel)}
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
