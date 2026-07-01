"use client"

import type { ReactNode } from "react"

import { DashboardSkeleton } from "@workspace/web/features/dashboard/components/dashboard-skeleton"
import { useDashboardScopeTransition } from "@workspace/web/hooks/use-dashboard-scope-transition"
import { cn } from "@workspace/ui/lib/utils"

export function DashboardContentGate({ children }: { children: ReactNode }) {
  const { isScopePending } = useDashboardScopeTransition()

  return (
    <div className="relative min-h-0 w-full">
      <div
        className={cn(isScopePending && "invisible")}
        aria-hidden={isScopePending}
      >
        {children}
      </div>
      {isScopePending ? (
        <div className="absolute inset-0 z-10 bg-background">
          <DashboardSkeleton />
        </div>
      ) : null}
    </div>
  )
}
