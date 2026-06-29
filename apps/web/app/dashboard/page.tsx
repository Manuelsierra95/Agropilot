import { redirect } from "next/navigation"

import DashboardOverview from "@workspace/web/features/dashboard"
import { ensureDashboardScopeSearchParams } from "@workspace/web/lib/dashboard/ensure-dashboard-scope"

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardOverviewPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams
  const redirectTo = await ensureDashboardScopeSearchParams(
    "/dashboard",
    params
  )

  if (redirectTo) {
    redirect(redirectTo)
  }

  return <DashboardOverview />
}
