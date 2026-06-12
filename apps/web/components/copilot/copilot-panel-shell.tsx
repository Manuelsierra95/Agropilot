"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

function CopilotPanelSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-sidebar">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex flex-wrap justify-center gap-2">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
      <div className="border-t border-sidebar-border p-3">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}

const CopilotPanelLazy = dynamic(
  () =>
    import("./copilot-panel").then((mod) => ({ default: mod.CopilotPanel })),
  {
    loading: () => <CopilotPanelSkeleton />,
    ssr: false,
  }
)

export function CopilotPanelShell({ className }: { className?: string }) {
  return (
    <div className={cn("h-full min-h-0 w-full", className)}>
      <CopilotPanelLazy />
    </div>
  )
}

export function preloadCopilotPanel() {
  void import("./copilot-panel")
}
