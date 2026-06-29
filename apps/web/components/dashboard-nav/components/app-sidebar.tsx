import { NavMain } from "@workspace/web/components/dashboard-nav/components/nav-main"
import { NavModules } from "@workspace/web/components/dashboard-nav/components/nav-modules"
import { NavSettings } from "@workspace/web/components/dashboard-nav/components/nav-settings"
import { NavUser } from "@workspace/web/components/dashboard-nav/components/nav-user"
import { OrgSwitcher } from "@workspace/web/components/dashboard-nav/components/org-switcher-shell"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@workspace/ui/components/sidebar"
import { navigationData } from "@workspace/web/lib/navigation/navigation-data"
import { SearchMenuWrapper } from "@workspace/web/components/dashboard-nav/components/search/search-menu-wrapper"

export function AppSidebar() {
  return (
    <>
      <SidebarHeader className="p-2 pb-0">
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarHeader className="hidden overflow-visible p-2 pt-1 md:block">
        <SearchMenuWrapper />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavModules items={navigationData.modules} />
        <NavSettings items={navigationData.settings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navigationData.user} />
      </SidebarFooter>
    </>
  )
}
