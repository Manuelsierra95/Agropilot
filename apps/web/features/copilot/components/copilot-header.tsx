"use client"

import { Bot, Maximize2, Minimize2, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { useCopilotLayout } from "@workspace/web/features/copilot/copilot-layout-context"

export function CopilotHeader({ className }: { className?: string }) {
  const { isFullscreen, toggleFullscreen, closeCopilot } = useCopilotLayout()

  return (
    <header
      className={cn(
        "flex h-10 shrink-0 items-center justify-between border-b border-sidebar-border px-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Bot className="size-4 shrink-0 text-sidebar-foreground" />
        <span className="truncate text-sm font-medium text-sidebar-foreground">
          Agropilot
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleFullscreen}
          aria-label={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={closeCopilot}
          aria-label="Cerrar copilot"
        >
          <X className="size-4" />
        </Button>
      </div>
    </header>
  )
}
