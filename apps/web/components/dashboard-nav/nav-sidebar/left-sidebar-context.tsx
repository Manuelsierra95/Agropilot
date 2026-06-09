"use client"

import { createContext, useContext, type ReactNode } from "react"

import { useSidebar } from "@workspace/ui/components/sidebar"

type LeftSidebarContextType = {
  open: boolean
  toggleSidebar: () => void
}

const LeftSidebarContext = createContext<LeftSidebarContextType | null>(null)

export function useLeftSidebar() {
  const context = useContext(LeftSidebarContext)
  if (!context) {
    throw new Error("useLeftSidebar must be used within LeftSidebarBridge")
  }
  return context
}

/**
 * Must be placed as a direct child of the outer (left) SidebarProvider,
 * before the inner (right/copilot) SidebarProvider is mounted.
 * Captures the outer sidebar state and exposes it via LeftSidebarContext
 * so that deeply nested components can target it specifically.
 */
export function LeftSidebarBridge({ children }: { children: ReactNode }) {
  const { open, toggleSidebar } = useSidebar()

  return (
    <LeftSidebarContext.Provider value={{ open, toggleSidebar }}>
      {children}
    </LeftSidebarContext.Provider>
  )
}
