"use client"

import type { ReactNode } from "react"

import { DashboardDataLoader } from "@/components/dashboard-nav/dashboard-data-loader"
import { DashboardScopeTransitionProvider } from "@/hooks/use-dashboard-scope-transition"

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <DashboardScopeTransitionProvider>
      <DashboardDataLoader />
      {children}
    </DashboardScopeTransitionProvider>
  )
}
