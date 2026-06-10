import { CopilotButton } from "@/components/copilot/copilot-button"
import { CampaignSwitcher } from "@/components/dashboard-nav/components/campaign-switcher"
import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher"
import { QuickActionsButton } from "@/components/dashboard-nav/components/quick-actions/quick-actions-button"
import { NavDockBackButton } from "@/components/dashboard-nav/nav-dock/nav-dock-back-button"
import { navigationData } from "@/lib/navigation/navigation-data"

export function NavDockHeader() {
  // TODO: Moverlo a un nivel inferior y traer los datos de la API
  const parcels = navigationData.parcels

  return (
    <header className="sticky top-0 z-40 flex min-h-12 shrink-0 items-center overflow-hidden border-b bg-sidebar px-2 sm:px-2">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center py-1 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:gap-2 lg:py-0">
        <div className="justify-self-start lg:contents">
          <NavDockBackButton />
        </div>
        <div className="flex min-w-0 items-center justify-center gap-1 justify-self-center lg:contents">
          <ParcelSwitcher parcels={parcels} variant="dock" />
          <CampaignSwitcher />
        </div>
        <div className="flex items-center justify-end gap-1 justify-self-end lg:contents">
          <QuickActionsButton />
          <CopilotButton />
        </div>
      </div>
    </header>
  )
}
