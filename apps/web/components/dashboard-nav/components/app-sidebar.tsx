import { NavMain } from "@/components/dashboard-nav/components/nav-main"
import { NavModules } from "@/components/dashboard-nav/components/nav-modules"
import { NavSettings } from "@/components/dashboard-nav/components/nav-settings"
import { NavUser } from "@/components/dashboard-nav/components/nav-user"
import { OrgSwitcher } from "@/components/dashboard-nav/components/org-switcher"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@workspace/ui/components/sidebar"
import { navigationData } from "@/lib/navigation/navigation-data"
import { SearchMenuWrapper } from "@/components/dashboard-nav/components/search/search-menu-wrapper"

const organizationsData = [
  {
    id: "org-1",
    name: "Acme Corp",
    logo: "https://ui.shadcn.com/avatars/01.png",
    plan: "Pro",
  },
  {
    id: "org-2",
    name: "Globex Inc",
    logo: "https://ui.shadcn.com/avatars/02.png",
    plan: "Free",
  },
  {
    id: "org-3",
    name: "Initech",
    logo: "https://ui.shadcn.com/avatars/03.png",
    plan: "Enterprise",
  },
]

export function AppSidebar() {
  return (
    <>
      <SidebarHeader className="p-2 pb-0">
        <OrgSwitcher organizations={organizationsData} />
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
