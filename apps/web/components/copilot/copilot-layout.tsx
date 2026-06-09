import { type CSSProperties, type ReactNode } from "react"
import { cookies } from "next/headers"

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

import { CopilotPanel } from "@/components/copilot/copilot-panel"

const COPILOT_SIDEBAR_COOKIE = "copilot_sidebar_state"

export async function CopilotLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  // Persisting the copilot sidebar state in the cookie.
  const cookieStore = await cookies()
  const defaultOpen =
    cookieStore.get(COPILOT_SIDEBAR_COOKIE)?.value !== "false"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className={cn(
        "flex h-svh max-h-svh min-w-0 flex-1 overflow-hidden",
        className
      )}
      style={{ "--sidebar-width": "25rem" } as CSSProperties}
      keyboardShortcut="i"
      cookieName={COPILOT_SIDEBAR_COOKIE}
    >
      {children}
      <Sidebar side="right" collapsible="offcanvas">
        <SidebarContent className="overflow-hidden bg-sidebar p-0 text-sidebar-foreground">
          <CopilotPanel />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}
