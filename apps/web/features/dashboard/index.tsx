"use client"

import {
  dashboardContainerClassName,
  dashboardMainClassName,
} from "@workspace/web/features/dashboard/lib/dashboard-grid-layout"
import { useDashboardOverview } from "@workspace/web/hooks/dashboard"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import type {
  DashboardOverviewAll,
  DashboardOverviewSingle,
} from "@workspace/schemas"

import { DashboardAllView } from "@workspace/web/features/dashboard/views/all"
import { DashboardSingleView } from "@workspace/web/features/dashboard/views/single"

export default function DashboardOverview() {
  const isAllParcels = useIsAllParcelsSelected()
  const overview = useDashboardOverview()
  const data = overview.data
  const isPending = overview.isPending || !data

  const olivePrices = data?.market.olivePrices ?? []
  const parcelsMap = data?.operations.parcelsMap ?? []
  const upcomingWeek = data?.operations.upcomingWeek ?? []
  const recentTransactions = data?.finance.recentTransactions ?? []
  const productionValue = data?.crop.productionValue

  return (
    <div className={dashboardContainerClassName}>
      <main className={dashboardMainClassName}>
        {isAllParcels ? (
          <DashboardAllView
            data={data as DashboardOverviewAll | undefined}
            olivePrices={olivePrices}
            parcelsMap={parcelsMap}
            upcomingWeek={upcomingWeek}
            recentTransactions={recentTransactions}
            productionValue={productionValue}
            isPending={isPending}
          />
        ) : (
          <DashboardSingleView
            data={data as DashboardOverviewSingle | undefined}
            olivePrices={olivePrices}
            parcelsMap={parcelsMap}
            upcomingWeek={upcomingWeek}
            recentTransactions={recentTransactions}
            productionValue={productionValue}
            isPending={isPending}
            scopeKey={overview.scopeKey}
          />
        )}
      </main>
    </div>
  )
}
