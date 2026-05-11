import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { KpiCard, type KpiItem } from "./top-cards/price-kpi-card"
import { ExpensesPieChart } from "./chart/expenses-pie-chart"
import { IncomePieChart } from "./chart/income-pie-chart"

import { TransactionTable } from "./table"

import { mockTransactions as data } from "@/store/mockTransactions"
import { ChartAreaInteractive } from "./chart/components/lines-chart"
import { FinanceRecommendations } from "./top-cards/finance-recommendations"

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
    <DashboardPageContainer className="flex flex-col gap-4 md:gap-6">
      <div className="relative grid grid-cols-3 gap-4">
        <section className="col-span-2 grid grid-rows-[auto_1fr] gap-4">
          <FinanceRecommendations transactions={data} oils={oils} />
          <ChartAreaInteractive />
        </section>
        <section className="col-start-3 flex flex-col gap-4">
          <IncomePieChart data={data} />
          <ExpensesPieChart data={data} />
        </section>
      </div>
      <TransactionTable data={data} />
    </DashboardPageContainer>
  )
}
