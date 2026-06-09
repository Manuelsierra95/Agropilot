"use client"

import type { ReactNode } from "react"

import { DashboardProvider } from "@/features/copilot/dashboard-state"

export function DashboardProviders({ children }: { children: ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>
}
