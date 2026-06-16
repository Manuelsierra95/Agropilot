"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import { ResumeCrop } from "@/features/dashboard/resume-crop"
import { ResumeCropAll } from "@/features/dashboard/all/resume-crop-all"
import { dashboardGridSlot } from "@/features/dashboard/dashboard-grid-layout"
import { ResumeCropSkeleton } from "@/features/dashboard/dashboard-skeleton"

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
