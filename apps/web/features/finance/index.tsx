import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { GradientSeparator } from "@/components/gradient-separator"

import { KpiCard, type KpiItem } from "./top-cards/price-kpi-card"
import { ExpensesPieChart } from "./chart/expenses-pie-chart"
import { IncomePieChart } from "./chart/income-pie-chart"

import { TransactionTable } from "./table"

import { mockTransactions as data } from "@/store/mockTransactions"
import { ComparativeAreaChart } from "@/components/charts/comparative-area-chart"
import { FinanceRecommendations } from "./top-cards/finance-recommendations"
import { CropSeasonPredictionsCard } from "@/components/cards/crop-season-predictions-card"
import { FinanceRecommendationsCard } from "@/components/cards/finance-recommendations-card"
import { dashboardPriceKpis, dashboardTransactions } from "../dashboard"
import { CashFlowSummaryCard } from "@/components/cards/cash-flow-summary-card"

// Aceites
const oils: KpiItem[] = [
  {
    name: "Virgen Extra",
    price: 7.85,
    priceMin: 7.5,
    priceMax: 8.1,
    unit: "kg",
    updatedAt: "2025-03-24",
  },
  {
    name: "Virgen",
    price: 6.4,
    priceMin: 6.2,
    priceMax: 6.9,
    unit: "kg",
    updatedAt: "2025-03-24",
  },
  {
    name: "Lampante",
    price: 2.4,
    priceMin: 2.2,
    priceMax: 2.6,
    unit: "kg",
    updatedAt: "2025-03-24",
  },
]

export default function Finance() {
  return (
    <DashboardPageContainer className="grid grid-cols-[1fr_auto_1fr] grid-rows-[auto] gap-4">
      {/* <DashboardPageContainer className="flex flex-col gap-4 md:gap-6"> */}

      {/* Row 1 */}
      <div className="col-span-1 row-span-2">
        <IncomePieChart data={data} />
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-span-1 row-span-5"
      />

      <div className="col-span-1 col-start-3 row-span-3 row-start-1">
        <FinanceRecommendationsCard
          transactions={dashboardTransactions}
          oils={dashboardPriceKpis}
          redirectButton={false}
        />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-1 row-start-3"
      />

      {/* Row 2 */}

      <div className="col-span-1 row-span-2 row-start-4">
        <ExpensesPieChart data={data} />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-1 col-start-3 row-start-4"
      />

      <div className="col-span-1 col-start-3 row-start-5">
        <CashFlowSummaryCard transactions={dashboardTransactions} />
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 row-start-6"
      />

      <div className="col-span-3 row-start-7">
        <TransactionTable data={data} />
      </div>
    </DashboardPageContainer>
  )
}
