"use client"

import { CopilotButton } from "@workspace/web/components/copilot/copilot-button"
import { QuickActionsButton } from "@workspace/web/components/dashboard-nav/components/quick-actions/quick-actions-button"
import { SidebarTriggerWithSeparator } from "@workspace/web/components/dashboard-nav/components/sidebar-trigger"
import { CampaignSwitcher } from "@workspace/web/components/dashboard-nav/components/campaign-switcher-shell"
import { ParcelSwitcher } from "@workspace/web/components/dashboard-nav/components/parcel-switcher-shell"
import { Breadcrumbs } from "@workspace/web/components/ui/breadcrumbs"

export function NavSidebarHeader() {
  return (
    <header className="sticky top-0 z-10 grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-2">
      <div className="flex min-w-0 items-center justify-start gap-2 overflow-hidden px-2">
        <SidebarTriggerWithSeparator />
        <ParcelSwitcher />
      </div>

      <div className="flex max-w-[min(100vw-12rem,28rem)] min-w-0 items-center justify-center overflow-hidden px-2">
        <Breadcrumbs />
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 overflow-hidden px-2">
        <CampaignSwitcher />
        <QuickActionsButton />
        <CopilotButton />
      </div>
    </header>
  )
}
