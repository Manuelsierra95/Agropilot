import { GradientSeparator } from "@/components/ui/gradient-separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  dashboardContainerClassName,
  dashboardGridSlot,
  dashboardMainClassName,
} from "@/features/dashboard/dashboard-grid-layout"

function WidgetSkeleton({
  className,
  headerWidth = "w-32",
  contentHeight = "h-[120px]",
}: {
  className?: string
  headerWidth?: string
  contentHeight?: string
}) {
  return (
    <Card className={cn("min-w-0 bg-background ring-0", className)}>
      <CardHeader>
        <Skeleton className={cn("h-4", headerWidth)} />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn("w-full", contentHeight)} />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <Skeleton isLoading>
      <div className={dashboardContainerClassName}>
        <main className={dashboardMainClassName}>
          <div className={dashboardGridSlot.topRow}>
            <GradientSeparator
              orientation="horizontal"
              className={dashboardGridSlot.horizSepMobile}
            />
            <div className={dashboardGridSlot.rowInner}>
              <WidgetSkeleton className="min-w-0 flex-2" contentHeight="h-[140px]" />
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
              <WidgetSkeleton className="min-w-0 flex-1" contentHeight="h-[140px]" />
            </div>
          </div>

          <div className={dashboardGridSlot.resumeCropWrapper}>
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <WidgetSkeleton
              className={dashboardGridSlot.resumeCrop}
              headerWidth="w-40"
              contentHeight="h-[320px]"
            />
          </div>

          <div className={dashboardGridSlot.financeRow}>
            <GradientSeparator orientation="horizontal" />
            <div className={dashboardGridSlot.rowInner}>
              <WidgetSkeleton className="min-w-0 flex-1" contentHeight="h-[200px]" />
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
              <WidgetSkeleton className="min-w-0 flex-2" contentHeight="h-[200px]" />
            </div>
          </div>

          <div className={dashboardGridSlot.recoMapRow}>
            <GradientSeparator orientation="horizontal" />
            <div className={dashboardGridSlot.rowInner}>
              <WidgetSkeleton className="min-w-0 flex-1" contentHeight="h-[240px]" />
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
              <WidgetSkeleton className="min-w-0 flex-2" contentHeight="h-[280px]" />
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
              <WidgetSkeleton className="min-w-0 flex-[1.5]" contentHeight="h-[240px]" />
            </div>
          </div>

          <div className={dashboardGridSlot.tablesRow}>
            <GradientSeparator orientation="horizontal" />
            <div className={dashboardGridSlot.rowInner}>
              <WidgetSkeleton className="min-w-0 flex-1" contentHeight="h-[220px]" />
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
              <WidgetSkeleton className="min-w-0 flex-1" contentHeight="h-[220px]" />
            </div>
          </div>

          <div className={dashboardGridSlot.productionValueRow}>
            <GradientSeparator orientation="horizontal" />
            <WidgetSkeleton
              className={dashboardGridSlot.productionValue}
              headerWidth="w-48"
              contentHeight="h-[300px]"
            />
          </div>
        </main>
      </div>
    </Skeleton>
  )
}
