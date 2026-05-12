import type { ParcelApiResponse } from "@/features/parcel/components/parcel-types"
import { mockTransactions } from "@/store/mockTransactions"

import { KpiCard } from "./price-kpi-card"
import { dashboardPriceKpis } from "./price-kpi-mock"
import { FinanceRecommendationsCompact } from "./finance-recommendations-compact"
import { CashFlowSummaryCard } from "./cash-flow-summary-card"
import { CropSeasonPredictionsCard } from "./crop-season-predictions-card"
import { DashboardRiskDonut } from "./risk-summary-donut"
import { DashboardRiskRadar } from "./risk-summary-radar"

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

export function KpiSection() {
  return (
    <section className="grid grid-cols-3 grid-rows-[auto_1fr_1fr] gap-4">
      <KpiCard items={dashboardPriceKpis} />

      <CropSeasonPredictionsCard />

      <div className="col-start-1 row-span-2 row-start-2">
        <FinanceRecommendationsCompact
          transactions={dashboardTransactions}
          oils={dashboardPriceKpis}
        />
      </div>
      <div className="col-start-2 row-span-2 row-start-2">
        <CashFlowSummaryCard transactions={dashboardTransactions} />
      </div>

      <div className="col-start-3 row-span-3 row-start-1 flex flex-col gap-4">
        <DashboardRiskDonut apiResponse={dashboardRiskSummary} />
        <DashboardRiskRadar apiResponse={dashboardRiskSummary} />
      </div>
    </section>
  )
}
