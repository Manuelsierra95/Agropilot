import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher"
import { navigationData } from "@/lib/navigation/navigation-data"
import { CampaignSwitcher } from "@/components/dashboard-nav/components/campaign-switcher"
import { QuickAddButton } from "@/components/dashboard-nav/components/quick-add/quick-add-button"
import { NavDockBackButton } from "@/components/dashboard-nav/nav-dock/nav-dock-back-button"

export function NavDockHeader() {
  // TODO: Moverlo a un nivel inferior y traer los datos de la API
  const parcels = navigationData.parcels

  return (
    <header className="sticky top-0 z-40 overflow-hidden border-b bg-background px-2 py-1.5 sm:px-2">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-1 sm:gap-2">
        <NavDockBackButton />
        <ParcelSwitcher parcels={parcels} variant="dock" />
        <CampaignSwitcher />
        <QuickAddButton />
      </div>
    </header>
  )
}
