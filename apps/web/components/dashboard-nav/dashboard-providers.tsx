"use client"

import type { ReactNode } from "react"

import { DashboardDataLoader } from "@/components/dashboard-nav/dashboard-data-loader"
import { DashboardProvider } from "@/features/copilot/dashboard-state"
import { DashboardScopeTransitionProvider } from "@/hooks/use-dashboard-scope-transition"

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <DashboardScopeTransitionProvider>
      <DashboardProvider>
        <DashboardDataLoader />
        {children}
      </DashboardProvider>
    </DashboardScopeTransitionProvider>
  )
}
