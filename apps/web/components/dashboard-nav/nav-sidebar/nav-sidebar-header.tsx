import { CopilotButton } from "@/components/copilot/copilot-button"
import { QuickActionsButton } from "@/components/dashboard-nav/components/quick-actions/quick-actions-button"
import { SidebarTriggerWithSeparator } from "@/components/dashboard-nav/components/sidebar-trigger"
import { CampaignSwitcher } from "@/components/dashboard-nav/components/campaign-switcher"
import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { navigationData } from "@/lib/navigation/navigation-data"

export function NavSidebarHeader() {
  const parcels = navigationData.parcels

  return (
    <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center border-b bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-2">
      {/* Izquierda */}
      <div className="flex shrink-0 items-center gap-2 px-2">
        <SidebarTriggerWithSeparator />
        <ParcelSwitcher parcels={parcels} />
      </div>

      {/* Centro: ocupa el espacio disponible */}
      <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden px-2">
        <Breadcrumbs />
      </div>

      {/* Derecha */}
      <div className="flex shrink-0 items-center gap-2 px-2">
        <CampaignSwitcher />
        <QuickActionsButton />
        <CopilotButton />
      </div>
    </header>
  )
}
