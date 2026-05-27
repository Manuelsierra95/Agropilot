"use client"

import { useState } from "react"

import {
  Area,
  ComposedChart,
  Grid,
  Line,
  SeriesBar,
  XAxis,
  ChartTooltip,
  curveCatmullRom,
} from "@workspace/ui/components/charts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ComparisonMode =
  | "ingresos_gastos"
  | "ingresos_precio_aceite"
  | "margen_rendimiento"
  | "coste_recoleccion_ingreso"
  | "subvenciones_gastos"

type ChartRow = {
  date: string
  units: number
  revenue: number
  runRate: number
}

// ---------------------------------------------------------------------------
// Mock data
// Keys:
//   revenue  → línea principal  (series A)
//   runRate  → área de fondo    (series B)
//   units    → barras de volumen (escala independiente ~18-95)
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000
const START_MS = Date.UTC(2024, 8, 1, 12, 0, 0) // 1 Sep 2024

function isoDay(i: number) {
  return new Date(START_MS + i * 30 * DAY_MS).toISOString()
}

function smoothCycle(i: number, phase: number, n = 9) {
  return Math.sin((i / (n - 1)) * Math.PI * 2 + phase)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

const mockData: Record<ComparisonMode, ChartRow[]> = {
  // Ingresos suben en campaña de cosecha (nov-dic) y bajan. Gastos más estables.
  ingresos_gastos: Array.from({ length: 9 }, (_, i) => ({
    date: isoDay(i),
    revenue: clamp(
      Math.round(55 + 38 * smoothCycle(i, -0.4) + 8 * Math.sin(i / 3)),
      20,
      110
    ),
    runRate: clamp(
      Math.round(72 + 12 * smoothCycle(i, 0.8) + 5 * Math.cos(i / 4)),
      55,
      95
    ),
    units: clamp(
      Math.round(48 + 22 * smoothCycle(i, -0.3) + 6 * Math.sin(i / 2.5)),
      18,
      85
    ),
  })),

  // Precio aceite sube sostenidamente; ingresos correlacionados.
  ingresos_precio_aceite: Array.from({ length: 9 }, (_, i) => {
    const u = i / 8
    return {
      date: isoDay(i),
      revenue: clamp(
        Math.round(
          50 + 40 * u + 10 * smoothCycle(i, 0.5) + 4 * Math.sin(i / 3)
        ),
        30,
        110
      ),
      runRate: clamp(
        Math.round(60 + 30 * u + 6 * smoothCycle(i, 1.1) + 3 * Math.cos(i / 4)),
        45,
        100
      ),
      units: clamp(
        Math.round(
          75 - 20 * u + 12 * smoothCycle(i, -0.3) + 5 * Math.sin(i / 2)
        ),
        28,
        88
      ),
    }
  }),

  // Margen negativo al inicio, sube en cosecha, baja. Rendimiento crece progresivamente.
  margen_rendimiento: Array.from({ length: 9 }, (_, i) => {
    const u = i / 8
    return {
      date: isoDay(i),
      revenue: clamp(
        Math.round(-10 + 80 * Math.sin(u * Math.PI) + 8 * smoothCycle(i, 0.6)),
        -15,
        95
      ),
      runRate: clamp(
        Math.round(30 + 55 * u + 6 * smoothCycle(i, 1.4) + 4 * Math.cos(i / 4)),
        22,
        92
      ),
      units: clamp(
        Math.round(35 + 30 * Math.sin(u * Math.PI) + 8 * smoothCycle(i, -0.2)),
        14,
        80
      ),
    }
  }),

  // Coste recolección y ventas con pico en nov-dic.
  coste_recoleccion_ingreso: Array.from({ length: 9 }, (_, i) => {
    const peak = Math.sin((i / 8) * Math.PI)
    return {
      date: isoDay(i),
      revenue: clamp(
        Math.round(
          25 + 75 * peak + 8 * smoothCycle(i, 0.4) + 4 * Math.sin(i / 3)
        ),
        12,
        108
      ),
      runRate: clamp(
        Math.round(
          18 + 52 * peak + 6 * smoothCycle(i, 0.7) + 3 * Math.cos(i / 4)
        ),
        8,
        78
      ),
      units: clamp(
        Math.round(
          12 + 45 * peak + 7 * smoothCycle(i, -0.1) + 4 * Math.sin(i / 2.5)
        ),
        5,
        65
      ),
    }
  }),

  // Subvenciones PAC en tramos escalonados; gastos más variables.
  subvenciones_gastos: Array.from({ length: 9 }, (_, i) => {
    const u = i / 8
    return {
      date: isoDay(i),
      runRate: clamp(
        Math.round(
          45 +
            25 * Math.min(u * 3, 1) +
            5 * smoothCycle(i, 1.8) +
            3 * Math.sin(i / 5)
        ),
        35,
        82
      ),
      revenue: clamp(
        Math.round(
          55 + 18 * smoothCycle(i, 0.3) + 7 * Math.sin(i / 3) + u * 10
        ),
        38,
        88
      ),
      units: clamp(
        Math.round(30 + 14 * smoothCycle(i, -0.5) + 5 * Math.cos(i / 4)),
        14,
        55
      ),
    }
  }),
}

// ---------------------------------------------------------------------------
// Comparison metadata
// ---------------------------------------------------------------------------

interface ComparisonMeta {
  label: string
  group: string
  title: string
  description: string
  seriesA: string
  seriesB: string
  unitA: string
  unitB: string
}

const COMPARISONS: Record<ComparisonMode, ComparisonMeta> = {
  ingresos_gastos: {
    label: "Ingresos vs Gastos",
    group: "Financiero",
    title: "Ingresos vs Gastos",
    description: "Evolución de ingresos y gastos totales en el período",
    seriesA: "Ingresos",
    seriesB: "Gastos",
    unitA: "€",
    unitB: "€",
  },
  ingresos_precio_aceite: {
    label: "Ingresos vs Precio aceite",
    group: "Mercado",
    title: "Ingresos vs Precio de mercado del aceite",
    description:
      "Correlación entre tus ingresos y el precio del aceite de oliva",
    seriesA: "Ingresos",
    seriesB: "Precio aceite",
    unitA: "€",
    unitB: "€/L",
  },
  margen_rendimiento: {
    label: "Margen neto vs Rendimiento",
    group: "Rentabilidad",
    title: "Margen neto vs Rendimiento de cosecha",
    description: "¿Cuánto beneficio genera cada kg/ha producido?",
    seriesA: "Margen neto",
    seriesB: "Rendimiento",
    unitA: "€",
    unitB: "kg/ha",
  },
  coste_recoleccion_ingreso: {
    label: "Coste recolección vs Ingreso",
    group: "Rentabilidad",
    title: "Coste de recolección vs Ingreso por venta",
    description:
      "Eficiencia de la recolección respecto a los ingresos generados",
    seriesA: "Coste recolección",
    seriesB: "Ingreso venta",
    unitA: "€",
    unitB: "€",
  },
  subvenciones_gastos: {
    label: "Subvenciones PAC vs Gastos fijos",
    group: "Financiero",
    title: "Subvenciones PAC vs Gastos fijos",
    description:
      "¿En qué medida cubren las ayudas PAC tus costes fijos de explotación?",
    seriesA: "Subvenciones PAC",
    seriesB: "Gastos fijos",
    unitA: "€",
    unitB: "€",
  },
}

const SELECT_GROUPS: { label: string; modes: ComparisonMode[] }[] = [
  { label: "Financiero", modes: ["ingresos_gastos", "subvenciones_gastos"] },
  { label: "Mercado", modes: ["ingresos_precio_aceite"] },
  {
    label: "Rentabilidad",
    modes: ["margen_rendimiento", "coste_recoleccion_ingreso"],
  },
]

// ---------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------

const smooth = curveCatmullRom.alpha(0.42)

export function ComparativeAreaChart({
  defaultComparison = "ingresos_gastos",
  className,
}: {
  defaultComparison?: ComparisonMode
  className?: string
}) {
  const [mode, setMode] = useState<ComparisonMode>(defaultComparison)
  const [chartKey, setChartKey] = useState(0)

  const meta = COMPARISONS[mode]

  return (
    <Card
      className={cn(
        "@container/card flex h-full flex-col bg-background ring-0 transition-all duration-300 ease-in-out",
        className
      )}
    >
      <CardHeader>
        <CardTitle>{meta.title}</CardTitle>
        <CardDescription>{meta.description}</CardDescription>

        <CardAction className="flex items-center gap-2">
          <Select
            value={mode}
            onValueChange={(v) => setMode(v as ComparisonMode)}
          >
            <SelectTrigger
              className="w-56 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Seleccionar comparativa"
            >
              <SelectValue placeholder="Seleccionar comparativa" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {SELECT_GROUPS.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel className="px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </SelectLabel>
                  {group.modes.map((m) => (
                    <SelectItem key={m} value={m} className="rounded-lg">
                      {COMPARISONS[m].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className={cn("flex min-h-0 flex-1 flex-col justify-end")}>
        <ComposedChart
          key={chartKey}
          data={mockData[mode]}
          xDataKey="date"
          aspectRatio="2 / 1"
          barGap={0}
          maxBarSize={32}
        >
          <Grid horizontal />
          <Area
            dataKey="runRate"
            curve={smooth}
            fill="var(--chart-4)"
            fillOpacity={0.32}
          />
          <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
          <Line
            dataKey="revenue"
            curve={smooth}
            stroke="var(--chart-1)"
            strokeWidth={2.5}
          />
          <ChartTooltip
            showCrosshair={false}
            rows={(point) => [
              {
                color: "var(--chart-4)",
                label: meta.seriesB,
                value: `${(point.runRate as number).toLocaleString("es-ES")} ${meta.unitB}`,
              },
              {
                color: "var(--chart-3)",
                label: "Volumen",
                value: (point.units as number).toLocaleString("es-ES"),
              },
              {
                color: "var(--chart-1)",
                label: meta.seriesA,
                value: `${(point.revenue as number).toLocaleString("es-ES")} ${meta.unitA}`,
              },
            ]}
          />
          <XAxis numTicks={8} />
        </ComposedChart>
      </CardContent>
    </Card>
  )
}
