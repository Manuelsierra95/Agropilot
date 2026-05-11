"use client"

import * as React from "react"
import { ChevronsUpDown, Settings2Icon, ChevronsUpDownIcon } from "lucide-react"
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
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

type Organization = {
  id: string
  name: string
  logo?: string
  plan: string
}

export function OrgSwitcher({
  organizations,
}: {
  organizations: Organization[]
}) {
  const [activeOrg, setActiveOrg] = React.useState(organizations[0])

  if (!activeOrg) {
    return null
  }

  const initials = activeOrg.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                {activeOrg.logo ? (
                  <img
                    src={activeOrg.logo}
                    alt={activeOrg.name}
                    className="size-4"
                  />
                ) : (
                  <span className="text-sm">{initials}</span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg.name}{" "}
                  <span className="text-foreground/40">({activeOrg.plan})</span>
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={"bottom"}
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setActiveOrg(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="size-4" />
                  ) : (
                    <span className="text-sm">{initials}</span>
                  )}
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Settings2Icon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Gestionar organizaciones
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
