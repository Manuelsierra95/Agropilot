import { AppSidebar } from "@/components/dashboard-nav/components/app-sidebar"
import { NavSidebarHeader } from "@/components/dashboard-nav/nav-sidebar/nav-sidebar-header"
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
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="offcanvas">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <NavSidebarHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
