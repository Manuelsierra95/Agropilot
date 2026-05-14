import { Breadcrumbs } from "@/components/breadcrumbs"
import { SidebarTriggerWithSeparator } from "@/components/dashboard-nav/components/sidebar-trigger"
import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher"
import { navigationData } from "@/lib/navigation/navigation-data"
import { CropSeasonSwitcher } from "@/components/dashboard-nav/components/crop-season-switcher"
import { QuickActionsButton } from "@/components/dashboard-nav/components/quick-actions/quick-actions-button"

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
        <CropSeasonSwitcher />
        <QuickActionsButton />
      </div>
    </header>
  )
}
