import { ParcelSwitcher } from "@/components/dashboard-nav/components/parcel-switcher"
import { navigationData } from "@/lib/navigation/navigation-data"

export function NavDockHeader() {
  // TODO: Moverlo a un nivel inferior y traer los datos de la API
  const parcels = navigationData.parcels

  return (
    <header className="sticky top-0 z-40 border-b bg-background px-2 py-1.5">
      <ParcelSwitcher parcels={parcels} variant="dock" />
    </header>
  )
}
