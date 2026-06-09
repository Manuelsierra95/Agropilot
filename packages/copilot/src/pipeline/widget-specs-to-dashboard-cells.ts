import type { QueryResult } from "../schemas/chart-action-schema"
import type { AnswerFocus } from "../schemas/copilot-intent-schema"
import {
  DASHBOARD_SLOT_IDS,
  type CellSpec,
  type DashboardSlotId,
} from "../schemas/dashboard-grid-schema"
import type { WidgetSpec } from "../schemas/widget-schema"
import { inferDashboardCells } from "./infer-dashboard-cells"

function emptyCell(slot: DashboardSlotId): CellSpec {
  return { slot, kind: "empty" }
}

function chartQueryIndices(
  spec: Extract<WidgetSpec, { type: "line_chart" | "bar_chart" }>,
  resultCount: number
): number[] {
  return spec.queryIndices ?? Array.from({ length: resultCount }, (_, index) => index)
}

export function widgetSpecsToDashboardCells(
  widgets: WidgetSpec[] | undefined,
  results: QueryResult[],
  options: {
    message?: string
    userText?: string
    focus?: AnswerFocus
  } = {}
): CellSpec[] {
  if (!widgets || widgets.length === 0) {
    return inferDashboardCells(
      results,
      options.focus ?? "range",
      options.userText ?? ""
    )
  }

  const cells: Partial<Record<DashboardSlotId, CellSpec>> = {}
  let primaryChart:
    | Extract<WidgetSpec, { type: "line_chart" | "bar_chart" }>
    | undefined

  for (const widget of widgets) {
    switch (widget.type) {
      case "kpi":
        cells.top_a = {
          slot: "top_a",
          kind: "kpi",
          title: widget.title,
          queryIndex: widget.queryIndex ?? 0,
        }
        break
      case "alert":
        cells.top_c = {
          slot: "top_c",
          kind: "alert",
          title: widget.title,
          severity: widget.severity,
          message: widget.message,
        }
        break
      case "table":
        cells.detail = {
          slot: "detail",
          kind: "table",
          title: widget.title,
          queryIndex: widget.queryIndex ?? 0,
        }
        break
      case "line_chart":
      case "bar_chart":
        if (!primaryChart) {
          primaryChart = widget
        }
        break
    }
  }

  if (!primaryChart) {
    return inferDashboardCells(
      results,
      options.focus ?? "range",
      options.userText ?? ""
    )
  }

  const kind = primaryChart.type === "bar_chart" ? "bar" : "line"
  const queryIndices = chartQueryIndices(primaryChart, results.length)

  cells.main = {
    slot: "main",
    kind,
    title: primaryChart.title,
    queryIndex: queryIndices[0] ?? 0,
    queryIndices: queryIndices.length > 1 ? queryIndices : undefined,
  }

  if (!cells.top_a && results[0]) {
    cells.top_a = {
      slot: "top_a",
      kind: "kpi",
      title: results[0].label,
      queryIndex: 0,
    }
  }

  if (!cells.top_c) {
    cells.top_c = {
      slot: "top_c",
      kind: "alert",
      title: "Resumen",
      severity: "low",
      message:
        options.message ??
        options.userText?.slice(0, 120) ??
        "Datos actualizados.",
    }
  }

  if (!cells.detail) {
    cells.detail = {
      slot: "detail",
      kind: "table",
      title: "Detalle",
      queryIndex: 0,
    }
  }

  return DASHBOARD_SLOT_IDS.map((slot) => cells[slot] ?? emptyCell(slot))
}
