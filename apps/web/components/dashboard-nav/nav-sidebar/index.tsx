import { AppSidebar } from "@workspace/web/components/dashboard-nav/components/app-sidebar"
import { CopilotLayout } from "@workspace/web/components/copilot/copilot-layout"
import { LeftSidebarBridge } from "@workspace/web/components/dashboard-nav/nav-sidebar/left-sidebar-context"
import { DashboardContentScroll } from "@workspace/web/components/dashboard-nav/nav-sidebar/dashboard-content-scroll"
import { NavSidebarHeader } from "@workspace/web/components/dashboard-nav/nav-sidebar/nav-sidebar-header"
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"

export default async function NavSidebar({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="h-svh overflow-hidden"
    >
      <Sidebar collapsible="offcanvas">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <LeftSidebarBridge>
        <CopilotLayout className="min-w-0 flex-1">
          <SidebarInset className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <NavSidebarHeader />
            <DashboardContentScroll>{children}</DashboardContentScroll>
          </SidebarInset>
        </CopilotLayout>
      </LeftSidebarBridge>
    </SidebarProvider>
  )
}
