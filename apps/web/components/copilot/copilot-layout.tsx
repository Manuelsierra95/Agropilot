import { type CSSProperties, type ReactNode } from "react"
import { cookies } from "next/headers"

import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

import { CopilotShell } from "@workspace/web/components/copilot/copilot-shell"

const COPILOT_SIDEBAR_COOKIE = "copilot_sidebar_state"

export async function CopilotLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
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
      <CopilotShell>{children}</CopilotShell>
    </SidebarProvider>
  )
}
