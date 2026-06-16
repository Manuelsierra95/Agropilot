"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import { OlivePrice } from "@/features/dashboard/olive-price"
import { SellingWindow } from "@/features/dashboard/selling-window"
import { SellingWindowAll } from "@/features/dashboard/all/selling-window-all"
import { dashboardGridSlot } from "@/features/dashboard/dashboard-grid-layout"
import { WidgetSkeleton } from "@/features/dashboard/dashboard-skeleton"

interface QueryState {
  isPending: boolean
  data: any
}

interface DashboardTopRowProps {
  olivePrices: QueryState
  sellingWindow: QueryState & { scopeKey?: string }
  allSellingWindows: QueryState
  isAllParcels: boolean
}

export function DashboardTopRow({
  olivePrices,
  sellingWindow,
  allSellingWindows,
  isAllParcels,
}: DashboardTopRowProps) {
  return (
    <div className={dashboardGridSlot.topRow}>
      <GradientSeparator
        orientation="horizontal"
        className={dashboardGridSlot.horizSepMobile}
      />
      <div className={dashboardGridSlot.rowInner}>
        {olivePrices.isPending && !olivePrices.data ? (
          <WidgetSkeleton
            className="min-w-0 flex-2"
            contentHeight="h-[140px]"
          />
        ) : (
          <OlivePrice
            className="min-w-0 flex-2"
            items={olivePrices.data ?? []}
          />
        )}
        <GradientSeparator
          orientation="vertical"
          className={dashboardGridSlot.verticalSepDesktop}
        />
        {isAllParcels ? (
          allSellingWindows.isPending && !allSellingWindows.data?.length ? (
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[140px]"
            />
          ) : (
            <SellingWindowAll
              className="min-w-0 flex-1"
              items={allSellingWindows.data ?? []}
            />
          )
        ) : sellingWindow.isPending && !sellingWindow.data ? (
          <WidgetSkeleton
            className="min-w-0 flex-1"
            contentHeight="h-[140px]"
          />
        ) : sellingWindow.data ? (
          <SellingWindow
            className="min-w-0 flex-1"
            scopeKey={sellingWindow.scopeKey ?? ""}
            {...sellingWindow.data}
          />
        ) : null}
      </div>
    </div>
  )
}
