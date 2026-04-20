import { DockToggle } from "./dock-toggle"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/dashboard-nav/components/app-sidebar"

export default function NavDock() {
  return (
    <DockToggle>
      <SidebarProvider>
        <div className="fixed inset-x-4 bottom-20 z-50 max-h-[70vh] overflow-y-auto rounded-xl border bg-background shadow-lg">
          <AppSidebar />
        </div>
      </SidebarProvider>
    </DockToggle>
  )
}
