import { CopilotLayout } from "@/components/copilot/copilot-layout"
import { DashboardContentGate } from "@/components/dashboard-nav/dashboard-content-gate"
import NavDock from "@/components/dashboard-nav/nav-dock"
import NavSidebar from "@/components/dashboard-nav/nav-sidebar"
import { NavDockHeader } from "./nav-dock/nav-dock-header"

export async function NavigationWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <nav>
      {/* Mobile: Navbar Dock */}
      <div className="flex min-h-screen flex-col lg:hidden">
        <CopilotLayout className="flex min-h-0 flex-1 flex-col">
          <NavDockHeader />
          <div className="min-h-0 flex-1 overflow-auto">
            <DashboardContentGate>{children}</DashboardContentGate>
          </div>
        </CopilotLayout>
        <NavDock />
      </div>

      {/* Tablet y Desktop: Sidebar */}
      <div className="hidden lg:block">
        <NavSidebar>{children}</NavSidebar>
      </div>
    </nav>
  )
}
