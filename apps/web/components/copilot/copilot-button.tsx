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

export function CopilotButton({ className }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={open ? "secondary" : "outline"}
          size="icon"
          className={cn("size-8", className)}
          onClick={toggleSidebar}
          aria-label={open ? "Ocultar copilot" : "Mostrar copilot"}
          aria-pressed={open}
        >
          <Bot className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {open ? "Ocultar copilot" : "Mostrar copilot"}
        <span className="ml-1.5 opacity-60">(⌘I)</span>
      </TooltipContent>
    </Tooltip>
  )
}
