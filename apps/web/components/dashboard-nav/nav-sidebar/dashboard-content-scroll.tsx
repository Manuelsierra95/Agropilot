"use client"

import { type ReactNode } from "react"

import { ScrollArea } from "@workspace/ui/components/scroll-area"

export function DashboardContentScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollArea type="hover" className="h-full min-h-0 w-full flex-1">
      {children}
    </ScrollArea>
  )
}
