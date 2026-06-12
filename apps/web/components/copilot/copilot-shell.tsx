"use client"

import { type ReactNode } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { CopilotPanelShell } from "@/components/copilot/copilot-panel-shell"
import { CopilotChatProvider } from "@/features/copilot/copilot-chat-provider"
import { CopilotLayoutProvider, useCopilotLayout } from "@/features/copilot/copilot-layout-context"

function CopilotSurface() {
  const { open } = useSidebar()
  const { isFullscreen } = useCopilotLayout()
  const shouldMount = open || isFullscreen

  if (!shouldMount) return null

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex h-svh max-h-svh w-full flex-col overflow-hidden bg-sidebar">
        <CopilotPanelShell className="h-full min-h-0 w-full flex-1" />
      </div>
    )
  }

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarContent className="overflow-hidden bg-sidebar p-0 text-sidebar-foreground">
        <CopilotPanelShell />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export function CopilotShell({ children }: { children: ReactNode }) {
  return (
    <CopilotChatProvider>
      <CopilotLayoutProvider>
        {children}
        <CopilotSurface />
      </CopilotLayoutProvider>
    </CopilotChatProvider>
  )
}
