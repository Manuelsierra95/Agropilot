import { DashboardMap } from "@/features/dashboard/map"
import { SectionCards } from "./metrics/sections-cards"
import { ChartAreaInteractive } from "./metrics/chart"
import { DataTable } from "./finance"
import { mockTransactions as data } from "@/store/mockTransactions"
import { EventsList } from "./events"
import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { GridSeparator } from "@/components/grid-separator"

export default function DashboardOverview() {
  return (
    // TODO: Implementar los skeletons con boneyard-js
    <DashboardPageContainer className="radius-0">
      <div className="rounded-lg border">
        <SectionCards />
        <GridSeparator cardClassName="h-4" position="full" />

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12">
          <DashboardMap />
          <EventsList />
        </div>
        <GridSeparator cardClassName="h-4" position="full" />

        {/* TODO: Mostrar grafico relevante, con datos sobre ganancias, variaciones de precio, etc */}
        {/* Los precios los variare dependiendo de la ubicacion de la parcela! */}
        <ChartAreaInteractive />
        <GridSeparator cardClassName="h-4" position="full" />

        {/* TODO: Mas graficos en Donuts y diferentes formas, sobre cambios en el riego en la ubicacion de la parcela, y demas */}
        {/* TODO: Mostrar solo las ultimas transacciones */}
        <DataTable data={data} />
      </div>
    </DashboardPageContainer>
  )
}
