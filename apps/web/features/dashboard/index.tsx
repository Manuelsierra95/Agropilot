import { DashboardMap } from "@/features/dashboard/map"
import { MetricCards } from "./metrics/sections-cards"
import { ChartAreaInteractive } from "./metrics/chart"
import { FinanceOverview } from "./finance"
import { EventsList } from "./events"
import { DashboardPageContainer } from "@/components/dashboard-page-container"

export default function DashboardOverview() {
  return (
    // TODO: Implementar los skeletons con boneyard-js
    <DashboardPageContainer className="flex flex-col gap-4 md:gap-6">
      <MetricCards />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-12">
        <DashboardMap />
        <EventsList />
      </section>

      {/* TODO: Mostrar grafico relevante, con datos sobre ganancias, variaciones de precio, etc */}
      {/* Los precios los variare dependiendo de la ubicacion de la parcela! */}
      <ChartAreaInteractive />

      {/* TODO: Mas graficos en Donuts y diferentes formas, sobre cambios en el riego en la ubicacion de la parcela, y demas */}
      {/* TODO: Mostrar solo las ultimas transacciones */}
      <FinanceOverview />
    </DashboardPageContainer>
  )
}
