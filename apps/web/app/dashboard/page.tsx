import { Suspense } from "react"
import { redirect } from "next/navigation"

import DashboardOverview from "@/features/dashboard/default-view"
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton"
import { ensureDashboardScopeSearchParams } from "@/lib/dashboard/ensure-dashboard-scope"

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardOverviewPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams
  const redirectTo = await ensureDashboardScopeSearchParams("/dashboard", params)

  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview searchParams={params} />
    </Suspense>
  )
}
