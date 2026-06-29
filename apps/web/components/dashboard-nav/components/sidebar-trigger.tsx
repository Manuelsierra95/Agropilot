"use client"

import { PanelLeftIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

import { useLeftSidebar } from "@workspace/web/components/dashboard-nav/nav-sidebar/left-sidebar-context"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

export function SidebarTriggerWithSeparator() {
  const { open, toggleSidebar } = useLeftSidebar()

  if (open) return null

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="ghost"
            size="icon-sm"
            className="-ml-1"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <PanelLeftIcon />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Mostrar barra lateral
          <span className="ml-1.5 opacity-60">(⌘B)</span>
        </TooltipContent>
      </Tooltip>
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
    </>
  )
}
