import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  dashboardContainerClassName,
  dashboardGridSlot,
  dashboardMainClassName,
} from "@workspace/web/features/dashboard/lib/dashboard-grid-layout"

const skeletonBlockClassName = "animate-pulse rounded-lg bg-secondary"

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn(skeletonBlockClassName, className)} aria-hidden />
}

export function ResumeCropSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "@container/resume-crop w-full min-w-0 bg-background ring-0",
        className
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-7 w-3/4 max-w-[220px]" />
            <SkeletonBlock className="h-4 w-1/2 max-w-[160px]" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-14" />
            <SkeletonBlock className="h-3 w-10" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SkeletonBlock className="h-px w-full rounded-none" />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <SkeletonBlock className="h-2 w-full rounded-full" />
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
        </div>
        <SkeletonBlock className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn("min-w-0 overflow-hidden bg-background ring-0", className)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="size-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <SkeletonBlock className="mx-4 h-[220px] w-[calc(100%-2rem)] rounded-xl @min-[1100px]/main:h-[240px]" />
      </CardContent>
    </Card>
  )
}

export function ProductionValueSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-w-0 bg-background ring-0", className)}>
      <CardHeader>
        <SkeletonBlock className="h-5 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <SkeletonBlock className="h-24 flex-1" />
          <SkeletonBlock className="h-24 flex-1" />
          <SkeletonBlock className="h-24 flex-1" />
        </div>
        <SkeletonBlock className="h-[180px] w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className={dashboardContainerClassName}>
      <main className={dashboardMainClassName}>
        <div className={dashboardGridSlot.topRow}>
          <GradientSeparator
            orientation="horizontal"
            className={dashboardGridSlot.horizSepMobile}
          />
          <div className={dashboardGridSlot.rowInner}>
            <WidgetSkeleton
              className="min-w-0 flex-2"
              contentHeight="h-[140px]"
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[140px]"
            />
          </div>
        </div>

        <div className={dashboardGridSlot.resumeCropWrapper}>
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
        </div>

        <div className={dashboardGridSlot.financeRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[200px]"
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <WidgetSkeleton
              className="min-w-0 flex-2"
              contentHeight="h-[200px]"
            />
          </div>
        </div>

        <div className={dashboardGridSlot.recoMapRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[240px]"
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <WidgetSkeleton
              className="min-w-0 flex-[1.5]"
              contentHeight="h-[240px]"
            />
          </div>
        </div>

        <div className={dashboardGridSlot.tablesRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[220px]"
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[220px]"
            />
          </div>
        </div>

        <div className={dashboardGridSlot.productionValueRow}>
          <GradientSeparator orientation="horizontal" />
          <ProductionValueSkeleton
            className={dashboardGridSlot.productionValue}
          />
        </div>
      </main>
    </div>
  )
}
