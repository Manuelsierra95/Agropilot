"use client"

import { useSidebar, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"

export function SidebarTriggerWithSeparator() {
  const { open } = useSidebar()

  if (open) return null

  return (
    <>
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
    </>
  )
}
