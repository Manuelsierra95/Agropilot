"use client"

import { useMemo, type CSSProperties, type KeyboardEvent } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import type { DashboardRisks } from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"
import { LinkButton } from "@workspace/web/components/ui/link-button"

import { useDashboardScopeActions } from "@workspace/web/hooks/use-dashboard-scope-actions"

const RISK_ENTRIES = [
  { key: "waterStress" as const, label: "Hídrico", shortLabel: "Híd." },
  { key: "fungalRisk" as const, label: "Fúngico", shortLabel: "Fúng." },
  { key: "insectRisk" as const, label: "Insectos", shortLabel: "Ins." },
  { key: "thermalStress" as const, label: "Térmico", shortLabel: "Tér." },
] as const

const RISK_HEAT_BANDS = [
  { max: 10, cssVar: "--risk-heat-safe", label: "Seguro" },
  { max: 30, cssVar: "--risk-heat-low", label: "Bajo" },
  { max: 50, cssVar: "--risk-heat-medium", label: "Medio" },
  { max: 70, cssVar: "--risk-heat-high", label: "Alto" },
  { max: 90, cssVar: "--risk-heat-very-high", label: "Muy alto" },
  { max: 100, cssVar: "--risk-heat-critical", label: "Crítico" },
] as const

type RiskKey = (typeof RISK_ENTRIES)[number]["key"]

export type ParcelRiskItem = {
  parcelId: string
  name: string
  risks: DashboardRisks
}

type HeatmapCell = {
  scorePct: number
  level: DashboardRisks[RiskKey]["level"]
  topReason: string
}

type HeatmapRow = {
  parcelId: string
  name: string
  maxScorePct: number
  cells: Record<RiskKey, HeatmapCell>
}

type RiskRadarMultiProps = {
  items: ParcelRiskItem[]
  className?: string
}

const GRID_COLS = "grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(2.5rem,1fr))]"

function riskScorePct(score: number): number {
  return Math.round(Math.max(0, Math.min(score, 1)) * 100)
}

function riskHeatBand(scorePct: number) {
  const clamped = Math.max(0, Math.min(scorePct, 100))
  return (
    RISK_HEAT_BANDS.find((band) => clamped < band.max) ??
    RISK_HEAT_BANDS[RISK_HEAT_BANDS.length - 1]
  )
}

function riskHeatStyle(scorePct: number): CSSProperties {
  const band = riskHeatBand(scorePct)
  return { backgroundColor: `var(${band.cssVar})` }
}

function buildHeatmapRows(items: ParcelRiskItem[]): HeatmapRow[] {
  return items
    .map((item) => {
      const cells = {} as Record<RiskKey, HeatmapCell>

      for (const entry of RISK_ENTRIES) {
        const detail = item.risks[entry.key]
        cells[entry.key] = {
          scorePct: riskScorePct(detail.score),
          level: detail.level,
          topReason: detail.reasons[0] ?? "Sin detalle",
        }
      }

      const maxScorePct = Math.max(
        ...RISK_ENTRIES.map((entry) => cells[entry.key].scorePct)
      )

      return {
        parcelId: item.parcelId,
        name: item.name,
        maxScorePct,
        cells,
      }
    })
    .sort((a, b) => b.maxScorePct - a.maxScorePct)
}

function handleRowKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  parcelId: string,
  selectParcel: (id: string) => void | Promise<void>
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    void selectParcel(parcelId)
  }
}

function RiskHeatLegend() {
  return (
    <div
      className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3"
      aria-label="Leyenda de niveles de riesgo"
    >
      <div className="flex h-2.5 overflow-hidden rounded-full ring-1 ring-border/40">
        {RISK_HEAT_BANDS.map((band) => (
          <div
            key={band.cssVar}
            className="min-w-0 flex-1"
            style={{ backgroundColor: `var(${band.cssVar})` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {RISK_HEAT_BANDS.map((band) => (
          <div
            key={band.cssVar}
            className="flex items-center gap-1 text-[10px] text-muted-foreground"
          >
            <span
              className="size-2.5 shrink-0 rounded-sm ring-1 ring-black/8 dark:ring-white/12"
              style={{ backgroundColor: `var(${band.cssVar})` }}
              aria-hidden
            />
            <span>{band.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type RiskHeatmapCellProps = {
  label: string
  cell: HeatmapCell
}

function RiskHeatmapCell({ label, cell }: RiskHeatmapCellProps) {
  const band = riskHeatBand(cell.scorePct)
  const ariaLabel = `${label}: ${cell.scorePct}%, ${band.label}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="block h-8 w-full min-w-8 rounded-sm ring-1 ring-black/8 dark:ring-white/12"
          style={riskHeatStyle(cell.scorePct)}
          aria-label={ariaLabel}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-left">
        <p className="font-medium">
          {label} · {cell.scorePct}% · {band.label}
        </p>
        <p className="text-background/80">{cell.topReason}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function RiskRadarMulti({ items, className }: RiskRadarMultiProps) {
  const { selectParcel } = useDashboardScopeActions()
  const rows = useMemo(() => buildHeatmapRows(items), [items])

  return (
    <Card
      className={cn(
        "flex h-full w-full flex-col bg-background ring-0",
        className
      )}
    >
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-base text-balance">
          Mapa de Riesgos
        </CardTitle>
        <CardDescription className="text-xs text-pretty">
          Comparativa de riesgos por parcela
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pb-2">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin datos de riesgos.</p>
        ) : (
          <TooltipProvider>
            <ScrollArea className="max-h-[400px]">
              <div
                className={cn("grid gap-1 pr-3", GRID_COLS)}
                role="table"
                aria-label="Mapa de riesgos por parcela"
              >
                <div
                  className={cn(
                    "sticky top-0 z-10 col-span-full grid gap-1 bg-background pb-1",
                    GRID_COLS
                  )}
                  role="row"
                >
                  <div
                    className="truncate px-1 text-[10px] font-medium text-muted-foreground sm:text-xs"
                    role="columnheader"
                  >
                    Parcela
                  </div>
                  {RISK_ENTRIES.map((entry) => (
                    <div
                      key={entry.key}
                      className="text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
                      role="columnheader"
                    >
                      <span className="sm:hidden">{entry.shortLabel}</span>
                      <span className="hidden sm:inline">{entry.label}</span>
                    </div>
                  ))}
                </div>

                {rows.map((row) => (
                  <div
                    key={row.parcelId}
                    role="row"
                    tabIndex={0}
                    className={cn(
                      "col-span-full grid cursor-pointer gap-1 rounded-sm transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      GRID_COLS
                    )}
                    onClick={() => void selectParcel(row.parcelId)}
                    onKeyDown={(event) =>
                      handleRowKeyDown(event, row.parcelId, selectParcel)
                    }
                  >
                    <div
                      className="flex min-w-0 items-center truncate px-1 text-sm font-medium"
                      role="rowheader"
                    >
                      {row.name}
                    </div>
                    {RISK_ENTRIES.map((entry) => (
                      <div key={entry.key} role="cell">
                        <RiskHeatmapCell
                          label={entry.label}
                          cell={row.cells[entry.key]}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <RiskHeatLegend />
          </TooltipProvider>
        )}
      </CardContent>
      <LinkButton text="Ver análisis completo" href="/parcel" />
    </Card>
  )
}
