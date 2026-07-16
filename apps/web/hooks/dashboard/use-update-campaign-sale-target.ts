"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { api } from "@workspace/web/lib/api"
import { invalidateDashboard } from "@workspace/web/lib/dashboard/invalidate-dashboard"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"
import type {
  DashboardOverviewAll,
  DashboardOverviewSingle,
  UpdateCampaignSaleTargetInput,
} from "@workspace/schemas"

function patchOverviewCampaignTarget(
  overview: DashboardOverviewSingle | DashboardOverviewAll,
  campaignTarget: number
): DashboardOverviewSingle | DashboardOverviewAll {
  if (!("sellingWindow" in overview.market)) return overview

  const marketAny = overview.market as any

  return {
    ...overview,
    market: {
      ...overview.market,
      sellingWindow: {
        ...overview.market.sellingWindow,
        campaignTarget,
      },
      allSellingWindows: marketAny.allSellingWindows ?? [],
    },
  }
}

export function useUpdateCampaignSaleTarget() {
  const queryClient = useQueryClient()
  const scope = useDashboardScope()

  return useMutation({
    mutationFn: (data: UpdateCampaignSaleTargetInput) =>
      api.finance.updateCampaignSaleTarget(data),
    onSuccess: ({ campaignTarget }) => {
      queryClient.setQueryData(
        dashboardQueryKeys.overview(scope),
        (current) =>
          current
            ? patchOverviewCampaignTarget(
                current as DashboardOverviewSingle | DashboardOverviewAll,
                campaignTarget
              )
            : current
      )

      invalidateDashboard(queryClient, ["finance"], {
        parcelId: scope.parcelId,
        campaignId: scope.campaignId,
        from: scope.from,
        to: scope.to,
      })

      void queryClient.refetchQueries({
        queryKey: dashboardQueryKeys.overview(scope),
      })

      toast.success("Objetivo de venta actualizado")
    },
    onError: () => {
      toast.error("No se pudo guardar el objetivo de venta")
    },
  })
}
