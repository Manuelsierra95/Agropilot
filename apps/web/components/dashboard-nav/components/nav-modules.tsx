import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { ChevronRightIcon, Lock } from "lucide-react"
import type {
  NavigationNavModulesItem,
  NavigationNavSubItem,
} from "@/lib/navigation/navigation-data"
import { ModuleStatusIcons } from "@/lib/navigation/navigation-data"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible"

export function NavModules({ items }: { items: NavigationNavModulesItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Modules</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const StatusIcon = item.status ? ModuleStatusIcons[item.status] : null

          // Caso 2: Disponible pero sin suscripción — redirige a compra
          if (
            item.status === "available" &&
            item.isActive &&
            item.isLocked &&
            item.purchaseUrl
          ) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.purchaseUrl}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    <Lock className="ml-auto size-4 text-muted-foreground" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Caso 1: coming_soon (disabled) — Caso 3: available con suscripción
          return (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
              disabled={item.isActive === false}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    {/* Caso 1: icono de estado (coming_soon) */}
                    {StatusIcon && item.status !== "available" && (
                      <StatusIcon className="ml-auto size-4 text-muted-foreground" />
                    )}
                    {/* Caso 3: chevron normal */}
                    {item.status === "available" && (
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem: NavigationNavSubItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
