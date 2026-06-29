"use client"

import type { ReactNode } from "react"

import { DashboardDataLoader } from "@workspace/web/components/dashboard-nav/dashboard-data-loader"
import { DashboardScopeTransitionProvider } from "@workspace/web/hooks/use-dashboard-scope-transition"

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <DashboardScopeTransitionProvider>
      <DashboardDataLoader />
      {children}
    </DashboardScopeTransitionProvider>
  )
}
