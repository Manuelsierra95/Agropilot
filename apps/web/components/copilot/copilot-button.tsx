"use client"

import { Bot } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { useSidebar } from "@workspace/ui/components/sidebar"

import { preloadCopilotPanel } from "@workspace/web/components/copilot/copilot-panel-shell"

export function CopilotButton({ className }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar()

  if (open) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("-ml-1", className)}
          onClick={toggleSidebar}
          onMouseEnter={preloadCopilotPanel}
          onFocus={preloadCopilotPanel}
          aria-label="Mostrar copilot"
          aria-pressed={false}
        >
          <Bot className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Mostrar copilot
        <span className="ml-1.5 opacity-60">(⌘I)</span>
      </TooltipContent>
    </Tooltip>
  )
}
