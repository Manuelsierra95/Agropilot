"use client"

import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { ResumeCrop } from "@workspace/web/features/dashboard/resume-crop"
import { ResumeCropAll } from "@workspace/web/features/dashboard/all/resume-crop-all"
import { dashboardGridSlot } from "@workspace/web/features/dashboard/dashboard-grid-layout"
import { ResumeCropSkeleton } from "@workspace/web/features/dashboard/dashboard-skeleton"

interface QueryState {
  isPending: boolean
  data: any
}

interface DashboardResumeCropProps {
  cropOverview: QueryState
  allCropOverviews: QueryState
  isAllParcels: boolean
}

export function DashboardResumeCrop({
  cropOverview,
  allCropOverviews,
  isAllParcels,
}: DashboardResumeCropProps) {
  return (
    <div className={dashboardGridSlot.resumeCropWrapper}>
      <GradientSeparator
        orientation="vertical"
        className={dashboardGridSlot.verticalSepDesktop}
      />
      {isAllParcels ? (
        allCropOverviews.isPending && !allCropOverviews.data?.length ? (
          <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
        ) : (
          <ResumeCropAll
            className={dashboardGridSlot.resumeCrop}
            items={allCropOverviews.data ?? []}
          />
        )
      ) : cropOverview.isPending && !cropOverview.data ? (
        <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
      ) : cropOverview.data ? (
        <ResumeCrop
          className={dashboardGridSlot.resumeCrop}
          data={{
            ...cropOverview.data,
            lastUpdate: new Date(cropOverview.data.lastUpdate),
          }}
        />
      ) : null}
    </div>
  )
}
