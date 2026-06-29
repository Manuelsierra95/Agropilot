"use client"

import * as React from "react"
import { ChevronsUpDownIcon, Settings2Icon } from "lucide-react"
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
import { useSession } from "@workspace/web/lib/auth-client"
import { parseAuthSession } from "@workspace/schemas"
import { useDashboardScopeActions } from "@workspace/web/hooks/use-dashboard-scope-actions"
import { OrgSwitcherPlaceholder } from "@workspace/web/components/dashboard-nav/components/switcher-placeholders"
import { useDashboardListsStore } from "@workspace/web/store/useDashboardListsStore"

export function OrgSwitcher() {
  const { data: session } = useSession()
  const organizations = useDashboardListsStore((state) => state.organizations)
  const isLoading = useDashboardListsStore(
    (state) => state.isLoadingOrganizations
  )
  const { selectOrganization } = useDashboardScopeActions()

  const activeOrganizationId =
    parseAuthSession(session?.session)?.activeOrganizationId ?? null
  const activeOrg =
    organizations.find((org) => org.id === activeOrganizationId) ??
    organizations[0]

  if (!activeOrg) {
    if (isLoading) {
      return <OrgSwitcherPlaceholder />
    }
    return null
  }

  const initials = activeOrg.name
    .split(" ")
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              disabled={isLoading}
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
                  <span className="text-foreground/40">
                    ({activeOrg.plan})
                  </span>
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => void selectOrganization(org.id)}
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
