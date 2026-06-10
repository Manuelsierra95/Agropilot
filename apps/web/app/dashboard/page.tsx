import { Suspense } from "react"
import DashboardOverview from "@/features/dashboard/default-view"
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton"

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
  )
}
