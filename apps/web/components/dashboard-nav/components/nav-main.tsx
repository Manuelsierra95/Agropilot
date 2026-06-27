import { PreservedLink } from "@/components/preserved-link"
import { SCOPE_KEYS } from "@/lib/navigation/scope"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import type { NavigationNavItem } from "@/lib/navigation/navigation-data"

export function NavMain({ items }: { items: NavigationNavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <PreservedLink href={item.url} include={item.scope ?? SCOPE_KEYS.global}>
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </PreservedLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
