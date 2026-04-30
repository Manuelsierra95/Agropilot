import { Breadcrumbs } from "@/components/breadcrumbs"
import { SidebarTriggerWithSeparator } from "@/components/dashboard-nav/components/sidebar-trigger"
import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher"
import { navigationData } from "@/lib/navigation/navigation-data"

export function NavSidebarHeader() {
  // TODO: Moverlo a un nivel inferior y traer los datos de la API
  const parcels = navigationData.parcels

  return (
    <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-2">
      <div className="flex items-center gap-2 px-2">
        <SidebarTriggerWithSeparator />
        <ParcelSwitcher parcels={parcels} />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <Breadcrumbs />
      </div>
    </header>
  )
}
