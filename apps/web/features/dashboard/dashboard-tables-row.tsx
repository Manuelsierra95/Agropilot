"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import { toCalendarEvents } from "@/lib/calendar/mappers"
import { RecentEvents } from "@/features/dashboard/recent-events"
import { RecentTransactions } from "@/features/dashboard/recent-transactions"
import { dashboardGridSlot } from "@/features/dashboard/dashboard-grid-layout"
import { WidgetSkeleton } from "@/features/dashboard/dashboard-skeleton"

interface QueryState {
  isPending: boolean
  data: any
}

interface DashboardTablesRowProps {
  upcomingWeek: QueryState
  recentTransactions: QueryState
  isAllParcels: boolean
}

export function DashboardTablesRow({
  upcomingWeek,
  recentTransactions,
  isAllParcels,
}: DashboardTablesRowProps) {
  return (
    <div className={dashboardGridSlot.tablesRow}>
      <GradientSeparator orientation="horizontal" />
      <div className={dashboardGridSlot.rowInner}>
        {upcomingWeek.isPending && !upcomingWeek.data ? (
          <WidgetSkeleton
            className="min-w-0 flex-1"
            contentHeight="h-[220px]"
          />
        ) : (
          <RecentEvents
            className="min-w-0 flex-1"
            data={toCalendarEvents(upcomingWeek.data ?? [])}
          />
        )}
        <GradientSeparator
          orientation="vertical"
          className={dashboardGridSlot.verticalSepDesktop}
        />
        {recentTransactions.isPending && !recentTransactions.data ? (
          <WidgetSkeleton
            className="min-w-0 flex-1"
            contentHeight="h-[220px]"
          />
        ) : (
          <RecentTransactions
            className="min-w-0 flex-1"
            data={recentTransactions.data ?? []}
            showParcelColumn={isAllParcels}
          />
        )}
      </div>
    </div>
  )
}
