import {
  Leaf,
  Zap,
  CircleAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  Banknote,
  ClipboardList,
  CircleCheck,
  User,
  Thermometer,
  Sprout,
  Sun,
  Wheat,
  Pencil,
} from "lucide-react"
import { PreservedLink } from "@workspace/web/components/preserved-link"
import { SCOPE_KEYS } from "@workspace/web/lib/navigation/scope"
import type { ScopeKey } from "@workspace/web/lib/navigation/scope"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"

import type {
  AgroclimateMetrics,
  AllModeSummary,
  ParcelApiResponse,
  ParcelItem,
  YieldData,
} from "@workspace/web/features/parcel/lib/parcel-types"
import { formatDateTime } from "@workspace/web/features/parcel/lib/parcel-utils"

type TempTrend = AgroclimateMetrics["tempTrend"]

const DEFAULT_AGROCLIMATE: AgroclimateMetrics = {
  currentTemp: 0,
  tempTrendPct: 0,
  tempTrend: "stable",
  kc: 0,
  gdd: 0,
  phenoStage: "—",
}
//
// Vars existentes reutilizadas:
//   --primary-expense   → temperatura subiendo, alertas críticas, salud baja
//   --primary-income    → salud alta, iconos vegetación
//   --color-projection  → temperatura bajando
//   --muted-foreground  → temperatura estable, labels
//   --task-pending-text → salud media, avisos
//
// Vars nuevas a añadir en globals.css:
//   --color-pheno  oklch(0.72 0.17 142)  → icono etapa fenológica (Sprout)
//   --color-gdd    oklch(0.73 0.16 55)   → icono GDD/Sol (Sun)
// ─────────────────────────────────────────────

const TREND_COLORS: Record<TempTrend, string> = {
  up: "var(--primary-expense)", // calor → rojo-naranja
  down: "var(--color-projection)", // frío  → azul
  stable: "var(--muted-foreground)", // sin cambio → gris
}

const TREND_ICON_MAP = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
} as const

// ─────────────────────────────────────────────
// Score helpers
// ─────────────────────────────────────────────

type RiskLevel = "low" | "medium" | "high" | "critical" | string

function riskLevelToPenalty(level: RiskLevel): number {
  switch (level) {
    case "low":
      return 0
    case "medium":
      return 10
    case "high":
      return 20
    case "critical":
      return 25
    default:
      return 5
  }
}

function computeParcelScore(apiResponse?: ParcelApiResponse): number {
  if (!apiResponse) return 75
  const r = apiResponse.risks
  const penalties = [
    riskLevelToPenalty(r.waterStress.level),
    riskLevelToPenalty(r.fungalRisk.level),
    riskLevelToPenalty(r.insectRisk.level),
    riskLevelToPenalty(r.thermalStress.level),
  ]
  const totalPenalty = penalties.reduce((a, b) => a + b, 0)
  const maxPenalty = penalties.length * 25
  return Math.round(((maxPenalty - totalPenalty) / maxPenalty) * 100)
}

type ScoreTokens = {
  color: string
  tooltip: string
}

function scoreToTokens(score: number): ScoreTokens {
  if (score >= 75)
    return {
      color: "var(--primary-income)", // verde
      tooltip: "Parcela en buen estado agronómico",
    }
  if (score >= 45)
    return {
      color: "var(--task-pending-text)", // ámbar
      tooltip: "Factores de riesgo moderados — revisa los detalles",
    }
  return {
    color: "var(--primary-expense)", // rojo-naranja
    tooltip: "Riesgo alto detectado — atención inmediata",
  }
}

// ─────────────────────────────────────────────
// MetricCell
// ─────────────────────────────────────────────

type MetricCellProps = {
  value: React.ReactNode
  label: string
  tooltip?: string
  href?: string
  linkProps?: {
    include?: ScopeKey[]
    override?: Partial<Record<ScopeKey, string | null>>
  }
}

function MetricCell({
  value,
  label,
  tooltip,
  href,
  linkProps,
}: MetricCellProps) {
  const inner = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 py-4 transition-colors hover:bg-muted/40">
      <div className="text-xl leading-none font-semibold tabular-nums">
        {value}
      </div>
      <div className="text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  )

  const wrapped = href ? (
    <PreservedLink href={href} {...linkProps} className="flex h-full w-full">
      {inner}
    </PreservedLink>
  ) : (
    inner
  )

  if (!tooltip) return wrapped

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-full w-full cursor-default">{wrapped}</div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-[260px] text-xs leading-relaxed"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

// ─────────────────────────────────────────────
// ParcelHero
// ─────────────────────────────────────────────

type ParcelHeroProps = {
  isAllSelected: boolean
  activeParcel?: ParcelItem
  parcelCount?: number
  allModeSummary?: AllModeSummary
  apiResponse?: ParcelApiResponse
  income?: number
  trend?: TempTrend
  employeeCount?: number
  tasksPending?: number
  tasksInProgress?: number
  agroclimate?: AgroclimateMetrics
  yieldData?: YieldData
  onEditParcel?: () => void
}

export function ParcelHero({
  isAllSelected,
  activeParcel,
  parcelCount = 0,
  allModeSummary,
  apiResponse,
  income,
  trend = "stable",
  employeeCount = 0,
  tasksPending = 0,
  tasksInProgress = 0,
  agroclimate = DEFAULT_AGROCLIMATE,
  yieldData,
  onEditParcel,
}: ParcelHeroProps) {
  const score = isAllSelected ? null : computeParcelScore(apiResponse)
  const scoreTokens = score !== null ? scoreToTokens(score) : null

  const { currentTemp, tempTrendPct, tempTrend, kc, gdd, phenoStage } =
    agroclimate
  const TrendIcon = TREND_ICON_MAP[tempTrend]
  const trendColor = TREND_COLORS[tempTrend]
  const trendSign = tempTrend === "up" ? "+" : tempTrend === "down" ? "−" : ""

  const kgPerTree =
    yieldData && yieldData.trees > 0
      ? yieldData.totalKg / yieldData.trees
      : null

  // ── Tasks display ──
  const tasksValue =
    tasksPending === 0 && tasksInProgress === 0 ? (
      <CircleCheck size={18} className="text-muted-foreground" />
    ) : (
      <span className="flex items-baseline gap-1">
        {tasksPending > 0 && (
          <span style={{ color: "var(--task-pending-text)" }}>
            {tasksPending}
          </span>
        )}
      </span>
    )

  const tasksTooltip =
    tasksPending === 0 && tasksInProgress === 0
      ? "Todo al día"
      : [
          tasksPending > 0
            ? `${tasksPending} tareas pendiente${tasksPending > 1 ? "s" : ""}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")

  // ── Bottom columns ──
  type Col = {
    value: React.ReactNode
    label: string
    tooltip?: string
    href?: string
    linkProps?: {
      include?: ScopeKey[]
      override?: Partial<Record<ScopeKey, string | null>>
    }
  }

  const bottomCols: Col[] = [
    {
      value: (
        <span>
          {gdd}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            °C·día
          </span>
        </span>
      ),
      label: "GDD",
      tooltip: "Grados-día acumulados desde inicio de campaña",
    },
    {
      value: (
        <span>
          Kc <span>{kc.toFixed(2)}</span>
        </span>
      ),
      label: "Coef. cultivo",
      tooltip: "Coeficiente de cultivo según etapa fenológica actual",
    },
    ...(kgPerTree !== null && yieldData
      ? [
          {
            value: (
              <span>
                {kgPerTree.toFixed(2)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  kg/árbol
                </span>
              </span>
            ),
            label: "Rendimiento",
            tooltip: `${yieldData.trees.toLocaleString("es-ES")} árboles · ${yieldData.totalKg.toLocaleString("es-ES")} kg totales`,
          } satisfies Col,
        ]
      : []),
    ...(scoreTokens !== null && score !== null
      ? [
          {
            value: (
              <span style={{ color: scoreTokens.color }}>
                <span
                  className="mr-1.5 mb-0.5 inline-block h-2 w-2 rounded-full"
                  style={{ background: scoreTokens.color }}
                />
                {score}%
              </span>
            ),
            label: "Balance hídrico",
            tooltip: scoreTokens.tooltip,
          } satisfies Col,
        ]
      : []),
    ...(income !== undefined
      ? [
          {
            value: (
              <span style={{ color: "var(--primary-income)" }}>
                {income >= 0 ? "+" : ""}
                {income.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </span>
            ),
            label: "Rentabilidad",
            tooltip: "Ingresos netos del período actual",
            href: "/dashboard/finance",
            linkProps: { include: SCOPE_KEYS.parcel },
          } satisfies Col,
        ]
      : []),
    ...(employeeCount > 0
      ? [
          {
            value: (
              <span className="flex items-center gap-1.5">
                <User size={16} className="text-muted-foreground" />
                {employeeCount}
              </span>
            ),
            label: "Empleados",
            href: "/dashboard/settings/organization",
            linkProps: { include: SCOPE_KEYS.global },
          } satisfies Col,
        ]
      : []),
    {
      value: tasksValue,
      label: "Tareas",
      tooltip: tasksTooltip,
      href: "/dashboard/calendar",
      linkProps: { include: SCOPE_KEYS.parcel },
    },
  ]

  const parcelName = isAllSelected
    ? "Todas las parcelas"
    : (apiResponse?.request.cropName ?? activeParcel?.name ?? "Parcela")

  return (
    <Card className="gap-0 overflow-hidden bg-background pt-0 ring-0">
      {/* ── Fila superior ── */}
      <div className="flex items-center justify-between gap-8 px-6 py-5">
        {/* Identidad */}
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-lg font-extralight tracking-wide text-muted-foreground uppercase">
            Inteligencia de Parcela
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl leading-none font-semibold tracking-tight">
              {parcelName}
            </h1>
            {!isAllSelected && activeParcel && onEditParcel && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={onEditParcel}
                aria-label="Editar parcela"
              >
                <Pencil className="size-4" />
              </Button>
            )}
          </div>
          {/* Metadatos con divisores */}
          {!isAllSelected && apiResponse && activeParcel && (
            <div className="mt-1 flex items-center gap-4">
              <span className="font-mono text-sm text-muted-foreground">
                Coords: {apiResponse.request.coords.lat.toFixed(4)},&nbsp;
                {apiResponse.request.coords.lng.toFixed(4)}
              </span>
              <GradientSeparator orientation="vertical" />
              <span className="text-sm text-muted-foreground">
                {activeParcel.type}
              </span>
              <GradientSeparator orientation="vertical" />
              <span className="text-sm text-muted-foreground">
                {activeParcel.area} m²
              </span>
              <GradientSeparator orientation="vertical" />
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_5px_var(--color-emerald-500)]" />
                {formatDateTime(apiResponse.summary.lastUpdate)}
              </span>
            </div>
          )}
        </div>

        {/* Temperatura + etapa fenológica */}
        {!isAllSelected && (
          <div className="flex shrink-0 items-center gap-5">
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light tracking-tight text-foreground tabular-nums">
                  {currentTemp.toFixed(1)}°C
                </span>
                <span
                  className="flex items-center gap-0.5 text-sm font-medium tabular-nums"
                  style={{ color: trendColor }}
                >
                  <TrendIcon size={13} aria-hidden />
                  {trendSign}
                  {Math.abs(tempTrendPct).toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Temperatura</p>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground">
                    <Sprout
                      size={14}
                      style={{ color: "var(--color-pheno)" }}
                      aria-hidden
                    />
                    {phenoStage}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {phenoStage} — inicio del crecimiento vegetativo
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <GradientSeparator orientation="horizontal" className="mx-6" />

      <CardContent className="flex items-stretch">
        {/* ── Fila inferior: cuadrícula de métricas ── */}
        {bottomCols.map((col, i) => [
          <div key={`metric-${col.label}-${i}`} className="flex-1">
            <MetricCell {...col} />
          </div>,
          i < bottomCols.length - 1 ? (
            <GradientSeparator
              key={`metric-sep-${col.label}-${i}`}
              orientation="vertical"
            />
          ) : null,
        ])}
      </CardContent>
      <GradientSeparator orientation="horizontal" />
    </Card>
  )
}
