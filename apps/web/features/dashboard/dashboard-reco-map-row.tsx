"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import { Recommendations } from "@/features/dashboard/recommendations"
import { DashboardMap } from "@/features/dashboard/map"
import { RiskRadar } from "@/features/dashboard/risk-radar"
import { RecommendationsAll } from "@/features/dashboard/all/recommendations-all"
import { RiskRadarMulti } from "@/features/dashboard/all/risk-radar-multi"
import { dashboardGridSlot } from "@/features/dashboard/dashboard-grid-layout"
import { MapSkeleton, WidgetSkeleton } from "@/features/dashboard/dashboard-skeleton"

interface QueryState {
  isPending: boolean
  data: any
}

interface DashboardRecoMapRowProps {
  recommendations: QueryState
  allRecommendations: QueryState
  parcelsMap: QueryState
  risks: QueryState
  allRisks: QueryState
  isAllParcels: boolean
}

export function DashboardRecoMapRow({
  recommendations,
  allRecommendations,
  parcelsMap,
  risks,
  allRisks,
  isAllParcels,
}: DashboardRecoMapRowProps) {
  return (
    <div className={dashboardGridSlot.recoMapRow}>
      <GradientSeparator orientation="horizontal" />
      <div className={dashboardGridSlot.rowInner}>
        {isAllParcels ? (
          allRecommendations.isPending &&
          allRecommendations.data === undefined ? (
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[240px]"
            />
          ) : (
            <RecommendationsAll
              className="min-w-0 flex-1"
              items={allRecommendations.data ?? []}
            />
          )
        ) : recommendations.isPending && !recommendations.data ? (
          <WidgetSkeleton
            className="min-w-0 flex-1"
            contentHeight="h-[240px]"
          />
        ) : (
          <Recommendations
            className="min-w-0 flex-1"
            data={{ recommendations: recommendations.data ?? [] }}
          />
        )}
        <GradientSeparator
          orientation="vertical"
          className={dashboardGridSlot.verticalSepDesktop}
        />
        {parcelsMap.isPending && !parcelsMap.data ? (
          <MapSkeleton className="min-w-0 flex-2" />
        ) : (
          <DashboardMap
            className="min-w-0 flex-2"
            parcels={parcelsMap.data ?? []}
          />
        )}
        <GradientSeparator
          orientation="vertical"
          className={dashboardGridSlot.verticalSepDesktop}
        />
        {isAllParcels ? (
          allRisks.isPending && !allRisks.data?.length ? (
            <WidgetSkeleton
              className="min-w-0 flex-[1.5]"
              contentHeight="h-[240px]"
            />
          ) : (
            <RiskRadarMulti
              className="min-w-0 flex-[1.5]"
              items={allRisks.data ?? []}
            />
          )
        ) : risks.isPending && !risks.data ? (
          <WidgetSkeleton
            className="min-w-0 flex-[1.5]"
            contentHeight="h-[240px]"
          />
        ) : risks.data ? (
          <RiskRadar
            className="min-w-0 flex-[1.5]"
            apiResponse={{ risks: risks.data }}
          />
        ) : null}
      </div>
    </div>
  )
}
