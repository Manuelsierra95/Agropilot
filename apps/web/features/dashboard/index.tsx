import { DashboardMap } from "@/features/dashboard/map"
import { ChartAreaInteractive } from "./metrics/chart"
import { FinanceOverview } from "./finance"
import { EventsList } from "./events"
import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { CashFlowSummaryCard } from "./kpis/cash-flow-summary-card"
import { CropSeasonPredictionsCard } from "./kpis/crop-season-predictions-card"
import { FinanceRecommendationsCompact } from "./kpis/finance-recommendations-compact"
import { KpiCard } from "./kpis/price-kpi-card"
import { dashboardPriceKpis } from "./kpis/price-kpi-mock"
import { DashboardRiskDonut } from "./kpis/risk-summary-donut"
import { DashboardRiskRadar } from "./kpis/risk-summary-radar"
import { mockTransactions } from "@/store/mockTransactions"
import { ParcelApiResponse } from "../parcel/components/parcel-types"

const dashboardTransactions = mockTransactions.map(
  ({ type, category, amount, paymentMethod, invoiceNumber, date }) => ({
    type,
    category,
    amount,
    paymentMethod,
    invoiceNumber,
    date,
  })
)

const dashboardRiskSummary = {
  risks: {
    waterStress: {
      level: "medium",
      score: 0.55,
      reasons: [
        "Deficit hidrico ponderado 7d: -3.2 mm/dia",
        "Kc fenologico aplicado: 0.55",
      ],
    },
    fungalRisk: {
      level: "low",
      score: 0.2,
      reasons: ["Temperatura media estable: 18.2 C", "Humedad relativa < 55%"],
    },
    insectRisk: {
      level: "low",
      score: 0.12,
      reasons: [
        "Dias secos consecutivos: 5",
        "Baja actividad de plagas reportada",
      ],
    },
    thermalStress: {
      level: "medium",
      score: 0.44,
      reasons: ["Picos > 30 C en 48h", "Amplitud termica alta"],
    },
  },
} satisfies Pick<ParcelApiResponse, "risks">

export default function DashboardOverview() {
  return (
    // TODO: Implementar los skeletons con boneyard-js
    <DashboardPageContainer className="grid grid-cols-3 grid-rows-[auto] gap-4">
      <div className="col-span-2 row-span-1 flex flex-col gap-4">
        <KpiCard items={dashboardPriceKpis} />
        <div className="flex gap-4">
          <CropSeasonPredictionsCard />
          <CashFlowSummaryCard transactions={dashboardTransactions} />
        </div>
      </div>

      <div className="col-span-1 row-span-1">
        <FinanceRecommendationsCompact
          transactions={dashboardTransactions}
          oils={dashboardPriceKpis}
        />
      </div>

      <div className="col-span-3 row-span-3 flex gap-4">
        <div className="min-w-0 flex-1">
          <EventsList />
        </div>
        <div className="min-w-0 flex-[2.5]">
          <DashboardMap />
        </div>
        <div className="min-w-0 flex-[1.5]">
          <DashboardRiskRadar apiResponse={dashboardRiskSummary} />
        </div>
      </div>

      <div className="col-span-3 flex gap-4">
        <ChartAreaInteractive />
      </div>

      <div className="col-span-3">
        <FinanceOverview />
      </div>
    </DashboardPageContainer>
  )
}
