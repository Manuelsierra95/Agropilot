"use client"

import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { parseAuthUser } from "@workspace/schemas"
import { PreservedLink } from "@workspace/web/components/preserved-link"
import { NavUserPlaceholder } from "@workspace/web/components/dashboard-nav/components/switcher-placeholders"
import { signOut, useSession } from "@workspace/web/lib/auth-client"
import { SCOPE_KEYS } from "@workspace/web/lib/navigation/scope"
import {
  BadgeCheckIcon,
  Building2Icon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"

const SETTINGS_LINKS = [
  {
    title: "Profile",
    href: "/dashboard/settings/profile",
    icon: BadgeCheckIcon,
  },
  {
    title: "Organization",
    href: "/dashboard/settings/organization",
    icon: Building2Icon,
  },
  {
    title: "Billing",
    href: "/dashboard/settings/billing",
    icon: CreditCardIcon,
  },
] as const

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { data: session, isPending } = useSession()

  const user = parseAuthUser(session?.user)

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/sign-in")
  }

  if (isPending || !user) {
    return <NavUserPlaceholder />
  }

  const initials = getInitials(user.name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? ""} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {SETTINGS_LINKS.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <PreservedLink
                    href={item.href}
                    include={SCOPE_KEYS.global}
                    className="cursor-pointer"
                  >
                    <item.icon />
                    {item.title}
                  </PreservedLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleSignOut()}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
