import FinancesSummaryCards from './SummaryCards'
import { ChartAreaInteractive } from './Charts'

const dummySummary = {
  totalIngresos: 12000,
  totalGastos: 8000,
  balance: 4000,
  balanceEsteMes: 500,
  ingresosEsteMes: 2000,
  gastosEsteMes: 1500,
}

export function Charts() {
  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 space-y-8">
      <FinancesSummaryCards summary={dummySummary} />
      <div className="w-full ">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
