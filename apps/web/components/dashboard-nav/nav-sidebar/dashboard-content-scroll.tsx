"use client"

import { type ReactNode } from "react"

import { DashboardContentGate } from "@/components/dashboard-nav/dashboard-content-gate"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export function DashboardContentScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollArea type="hover" className="h-full min-h-0 w-full flex-1">
      <DashboardContentGate>{children}</DashboardContentGate>
    </ScrollArea>
  )
}
