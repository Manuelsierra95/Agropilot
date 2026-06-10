"use client"

import { CopilotButton } from "@/components/copilot/copilot-button"
import { CampaignSwitcher } from "@/components/dashboard-nav/components/campaign-switcher-shell"
import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher-shell"
import { QuickActionsButton } from "@/components/dashboard-nav/components/quick-actions/quick-actions-button"
import { NavDockBackButton } from "@/components/dashboard-nav/nav-dock/nav-dock-back-button"

export function NavDockHeader() {
  return (
    <header className="sticky top-0 z-40 overflow-hidden border-b bg-background px-2 py-1.5 sm:px-2">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-1 sm:gap-2">
        <NavDockBackButton />
        <ParcelSwitcher variant="dock" />
        <CampaignSwitcher />
        <QuickActionsButton />
        <CopilotButton />
      </div>
    </header>
  )
}
