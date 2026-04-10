"use client"

import * as React from "react"

import { NavMain } from "@/components/nav/components/nav-main"
import { NavModules } from "@/components/nav/components/nav-modules"
import { NavSettings } from "@/components/nav/components/nav-settings"
import { NavUser } from "@/components/nav/components/nav-user"
import { ParcelSwitcher } from "@/components/nav/components/parcel-switcher"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@workspace/ui/components/sidebar"
import { navigationData } from "@/lib/navigation-data"

export function AppSidebar() {
  return (
    <>
      <SidebarHeader>
        <ParcelSwitcher parcels={navigationData.parcels} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavModules items={navigationData.modules} />
        <NavSettings items={navigationData.settings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navigationData.user} />
      </SidebarFooter>
    </>
  )
}
