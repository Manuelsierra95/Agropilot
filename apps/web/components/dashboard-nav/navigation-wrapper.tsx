import NavSidebar from "@/components/dashboard-nav/nav-sidebar"
import NavDock from "@/components/dashboard-nav/nav-dock"
import { NavDockHeader } from "./nav-dock/nav-dock-header"

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <nav>
      {/* Mobile: Navbar Dock */}
      <div className="min-h-screen lg:hidden">
        <NavDockHeader />
        {children}
        <NavDock />
      </div>

      {/* Tablet y Desktop: Sidebar */}
      <div className="hidden lg:block">
        <NavSidebar>{children}</NavSidebar>
      </div>
    </nav>
  )
}
