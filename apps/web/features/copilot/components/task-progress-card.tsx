"use client"

import { Loader2 } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export function TaskProgressCard({
  isStreaming = false,
  className,
}: {
  isStreaming?: boolean
  className?: string
}) {
  if (!isStreaming) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-3.5 animate-spin" />
      <span>Copilot está pensando…</span>
    </div>
  )
}
