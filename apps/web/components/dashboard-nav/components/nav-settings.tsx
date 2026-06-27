import { PreservedLink } from "@/components/preserved-link"
import { SCOPE_KEYS } from "@/lib/navigation/scope"
import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

interface NavSettingsItem {
  title: string
  url: string
  icon: LucideIcon
}

export function NavSettings({ items }: { items: NavSettingsItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <PreservedLink href={item.url} include={SCOPE_KEYS.global}>
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
