"use client"

import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { toCalendarEvents } from "@workspace/web/lib/calendar/mappers"
import { RecentEvents } from "@workspace/web/features/dashboard/recent-events"
import { RecentTransactions } from "@workspace/web/features/dashboard/recent-transactions"
import { dashboardGridSlot } from "@workspace/web/features/dashboard/dashboard-grid-layout"
import { WidgetSkeleton } from "@workspace/web/features/dashboard/dashboard-skeleton"

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
