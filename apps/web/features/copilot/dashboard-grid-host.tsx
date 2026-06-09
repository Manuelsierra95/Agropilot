"use client"

import {
  DASHBOARD_SLOT_IDS,
  type DashboardSlotId,
  type ResolvedCell,
} from "@workspace/copilot"

import {
  DashboardPageContainer,
  DashboardSlot,
} from "@/components/ui/dashboard-page-container"

import { useDashboardState } from "@/features/copilot/dashboard-state"

import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton"

import { AlertWidget } from "./widgets/alert-widget"
import { ChartWidget } from "./widgets/chart-widget"
import { DonutWidget } from "./widgets/donut-widget"
import { KpiWidget } from "./widgets/kpi-widget"
import { TableWidget } from "./widgets/table-widget"

function CellRenderer({ cell }: { cell: ResolvedCell }) {
  switch (cell.kind) {
    case "empty":
      return null
    case "kpi":
      return <KpiWidget widget={cell} />
    case "donut":
      return <DonutWidget cell={cell} />
    case "alert":
      return <AlertWidget widget={cell} />
    case "line":
      return <ChartWidget widget={{ type: "line_chart", view: cell.view }} />
    case "bar":
      return <ChartWidget widget={{ type: "bar_chart", view: cell.view }} />
    case "table":
      return <TableWidget widget={cell} />
  }
}

function SlotContent({
  slot,
  cell,
  status,
}: {
  slot: DashboardSlotId
  cell: ResolvedCell
  status: "idle" | "loading" | "ready" | "error"
}) {
  if (cell.kind === "empty") {
    if (status === "idle") {
      return (
        <DashboardSlot slot={slot}>
          <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 text-center text-xs text-muted-foreground">
            Pregunta al copilot para rellenar el overview
          </div>
        </DashboardSlot>
      )
    }
    return <DashboardSlot slot={slot} empty />
  }

  return (
    <DashboardSlot slot={slot}>
      <CellRenderer cell={cell} />
    </DashboardSlot>
  )
}

export function DashboardGridHost() {
  const { state } = useDashboardState()
  const { cells, status } = state.presentation

  if (status === "error") {
    return (
      <DashboardPageContainer>
        <div className="col-span-full flex min-h-[420px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          No se pudieron cargar los datos del dashboard.
        </div>
      </DashboardPageContainer>
    )
  }

  if (status === "loading") {
    return <DashboardSkeleton />
  }

  return (
    <DashboardPageContainer>
      {DASHBOARD_SLOT_IDS.map((slot) => (
        <SlotContent
          key={slot}
          slot={slot}
          cell={cells[slot]}
          status={status}
        />
      ))}
    </DashboardPageContainer>
  )
}
