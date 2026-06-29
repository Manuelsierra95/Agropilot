import { NavDockToggle } from "@workspace/web/components/dashboard-nav/nav-dock/nav-dock-toggle"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@workspace/web/components/dashboard-nav/components/app-sidebar"

export default function NavDock() {
  return (
    <NavDockToggle>
      <SidebarProvider>
        <div className="fixed inset-x-4 bottom-20 z-50 max-h-[70vh] overflow-y-auto rounded-xl border bg-background shadow-lg">
          <AppSidebar />
        </div>
      </SidebarProvider>
    </NavDockToggle>
  )
}
