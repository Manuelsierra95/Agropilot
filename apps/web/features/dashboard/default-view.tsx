import { GradientSeparator } from "@/components/ui/gradient-separator"
import { api } from "@/lib/api"
import type { DashboardCalendarEvent } from "@workspace/schemas"

import { OlivePrice } from "@/features/dashboard/olive-price"
import { ResumeCrop } from "@/features/dashboard/resume-crop"
import { FinanceResume } from "@/features/dashboard/finance-resume"
import { CampaignAccumulatedMargin } from "@/features/dashboard/campaign-accumulated-margin"
import { Recommendations } from "@/features/dashboard/recommendations"
import { DashboardMap } from "@/features/dashboard/map"
import { RiskRadar } from "@/features/dashboard/risk-radar"
import { RecentEvents } from "@/features/dashboard/recent-events"
import { RecentTransactions } from "@/features/dashboard/recent-transactions"
import { SellingWindow } from "@/features/dashboard/selling-window"
import { ProductionValue } from "@/features/dashboard/production-value"
import {
  dashboardContainerClassName,
  dashboardGridSlot,
  dashboardMainClassName,
} from "@/features/dashboard/dashboard-grid-layout"

type DashboardOverviewProps = {
  searchParams: Record<string, string | string[] | undefined>
}

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key]
  return typeof value === "string" ? value : undefined
}

function toCalendarEvents(
  events: DashboardCalendarEvent[]
): import("@/lib/calendar-mock").CalendarEvent[] {
  return events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }))
}

export default async function DashboardOverview({
  searchParams,
}: DashboardOverviewProps) {
  const overview = await api.dashboard.getOverview({
    parcelId: readParam(searchParams, "parcelId"),
    campaignId: readParam(searchParams, "campaignId"),
    from: readParam(searchParams, "from"),
    to: readParam(searchParams, "to"),
  })

  return (
    <div className={dashboardContainerClassName}>
      <main className={dashboardMainClassName}>
        <div className={dashboardGridSlot.topRow}>
          <GradientSeparator
            orientation="horizontal"
            className={dashboardGridSlot.horizSepMobile}
          />
          <div className={dashboardGridSlot.rowInner}>
            <OlivePrice
              className="min-w-0 flex-2"
              items={overview.olivePrices}
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <SellingWindow
              className="min-w-0 flex-1"
              {...overview.sellingWindow}
            />
          </div>
        </div>

        <div className={dashboardGridSlot.resumeCropWrapper}>
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          <ResumeCrop
            className={dashboardGridSlot.resumeCrop}
            data={{
              ...overview.olivar,
              lastUpdate: new Date(overview.olivar.lastUpdate),
            }}
          />
        </div>

        <div className={dashboardGridSlot.financeRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            <FinanceResume
              className="min-w-0 flex-1"
              transactions={overview.finance.transactions}
              oils={overview.olivePrices}
              previousCampaign={overview.finance.previousCampaign}
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <CampaignAccumulatedMargin
              className="min-w-0 flex-2"
              data={overview.campaignMargin}
            />
          </div>
        </div>

        <div className={dashboardGridSlot.recoMapRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            <Recommendations
              className="min-w-0 flex-1"
              data={overview.recommendations}
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <DashboardMap
              className="min-w-0 flex-2"
              parcels={overview.mapParcels}
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <RiskRadar
              className="min-w-0 flex-[1.5]"
              apiResponse={{ risks: overview.risks }}
            />
          </div>
        </div>

        <div className={dashboardGridSlot.tablesRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            <RecentEvents
              className="min-w-0 flex-1"
              data={toCalendarEvents(overview.recentEvents)}
            />
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            <RecentTransactions
              className="min-w-0 flex-1"
              data={overview.finance.transactions}
            />
          </div>
        </div>

        <div className={dashboardGridSlot.productionValueRow}>
          <GradientSeparator orientation="horizontal" />
          <ProductionValue
            {...overview.productionValue}
            className={dashboardGridSlot.productionValue}
          />
        </div>
      </main>
    </div>
  )
}
