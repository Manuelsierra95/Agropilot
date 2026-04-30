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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { ChevronLeftIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import type { NavigationParcel } from "@/lib/navigation/navigation-data"
import { getIcon } from "@/lib/icons"

interface ParcelSwitcherProps {
  parcels: NavigationParcel[]
  variant?: "sidebar" | "dock"
}

export function ParcelSwitcher({
  parcels,
  variant = "sidebar",
}: ParcelSwitcherProps) {
  const [activeParcel, setActiveParcel] = React.useState(parcels[0])
  if (!activeParcel) return null
  const ActiveIcon = getIcon(activeParcel.icon)

  const dropdownContent = (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      align="start"
      side="bottom"
      sideOffset={4}
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
  )

  if (variant === "dock") {
    return (
      <div className="relative flex items-center justify-center">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 flex size-8 items-center justify-center rounded-lg hover:bg-accent"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent">
              <div className="flex size-6 items-center justify-center rounded-md border">
                <ActiveIcon className="size-4" />
              </div>
              <span className="truncate text-sm font-medium">
                {activeParcel.name}
              </span>
              <ChevronsUpDownIcon className="size-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </div>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className="p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <ActiveIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeParcel.name}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
