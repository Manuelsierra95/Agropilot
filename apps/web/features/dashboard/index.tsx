import { DashboardMap } from "@/features/dashboard/map"
import { GradientSeparator } from "@/components/gradient-separator"
import { ComparativeAreaChart } from "@/components/charts/comparative-area-chart"
import { FinanceOverview } from "./finance"
import { EventsList } from "./events"
import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { CashFlowSummaryCard } from "@/components/cards/cash-flow-summary-card"
import { CropSeasonPredictionsCard } from "@/components/cards/crop-season-predictions-card"
import { FinanceRecommendationsCard } from "@/components/cards/finance-recommendations-card"
import { OlivePriceCard } from "@/components/cards/olive-price-card"
import { DashboardRiskRadar } from "@/components/cards/risk-summary-radar-card"

import { mockTransactions } from "@/store/mockTransactions"
import { ParcelApiResponse } from "../parcel/components/parcel-types"

export const dashboardTransactions = mockTransactions.map(
  ({ type, category, amount, paymentMethod, invoiceNumber, date }) => ({
    type,
    category,
    amount,
    paymentMethod,
    invoiceNumber,
    date,
  })
)

export const dashboardRiskSummary = {
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

export const dashboardPriceKpis = [
  {
    name: "Virgen Extra",
    price: 5.42,
    priceMin: 4.8,
    priceMax: 6.1,
    unit: "€/kg",
    updatedAt: "09/04/2026",
  },
  {
    name: "Virgen",
    price: 4.85,
    priceMin: 4.1,
    priceMax: 5.5,
    unit: "€/kg",
    updatedAt: "09/04/2026",
  },
  {
    name: "Lampante",
    price: 0.78,
    priceMin: 0.55,
    priceMax: 0.95,
    unit: "€/kg",
    updatedAt: "09/04/2026",
  },
]

export default function DashboardOverview() {
  return (
    // TODO: Implementar los skeletons con boneyard-js
    <DashboardPageContainer className="grid grid-cols-[1fr_auto_1fr_auto_1fr] grid-rows-[auto_auto_auto_auto_500px_auto_600px] gap-4">
      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-span-7 row-start-1"
      />

      {/* Row 1 */}
      <div className="col-span-3 col-start-1 row-start-1">
        <OlivePriceCard items={dashboardPriceKpis} />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 col-start-1 row-start-2"
      />

      <div className="col-start-5 row-span-3 row-start-1">
        <FinanceRecommendationsCard
          transactions={dashboardTransactions}
          oils={dashboardPriceKpis}
        />
      </div>

      {/* Row 2 */}
      <div className="col-start-1 row-start-3">
        <CropSeasonPredictionsCard />
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-2 row-start-3"
      />

      <div className="col-start-3 row-start-3">
        <CashFlowSummaryCard transactions={dashboardTransactions} />
      </div>

      {/* Separador horizontal */}
      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 col-start-1 row-start-4"
      />

      {/* Row 3 - EventsList | DashboardMap | DashboardRiskRadar */}
      <div className="col-span-3 col-start-1 row-start-5 flex gap-4">
        <div className="flex-1">
          <EventsList />
        </div>
        <GradientSeparator
          orientation="vertical"
          className="col-start-2 row-start-4"
        />
        <div className="flex-[2.5]">
          <DashboardMap />
        </div>
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-start-5 row-start-4"
      />

      <div className="col-start-5 row-start-5">
        <DashboardRiskRadar apiResponse={dashboardRiskSummary} />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 col-start-1 row-start-6"
      />

      <div className="col-span-3 col-start-1 row-start-7">
        <ComparativeAreaChart />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-2 col-start-5 row-start-6"
      />

      <div className="col-start-5 row-start-7">
        <FinanceOverview />
      </div>
    </DashboardPageContainer>
  )
}
