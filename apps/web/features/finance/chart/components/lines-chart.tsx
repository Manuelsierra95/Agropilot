"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
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

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockData: Record<
  ComparisonMode,
  { date: string; a: number; b: number }[]
> = {
  ingresos_gastos: [
    { date: "2024-09-01", a: 4200, b: 8100 },
    { date: "2024-10-01", a: 6800, b: 9400 },
    { date: "2024-11-01", a: 18500, b: 11200 },
    { date: "2024-12-01", a: 34000, b: 13800 },
    { date: "2025-01-01", a: 28000, b: 10500 },
    { date: "2025-02-01", a: 19500, b: 8200 },
    { date: "2025-03-01", a: 12000, b: 7600 },
    { date: "2025-04-01", a: 9500, b: 6900 },
    { date: "2025-05-01", a: 7800, b: 6400 },
  ],
  ingresos_precio_aceite: [
    { date: "2024-09-01", a: 4200, b: 3800 },
    { date: "2024-10-01", a: 6800, b: 4100 },
    { date: "2024-11-01", a: 18500, b: 4900 },
    { date: "2024-12-01", a: 34000, b: 5200 },
    { date: "2025-01-01", a: 28000, b: 5100 },
    { date: "2025-02-01", a: 19500, b: 4800 },
    { date: "2025-03-01", a: 12000, b: 4600 },
    { date: "2025-04-01", a: 9500, b: 4400 },
    { date: "2025-05-01", a: 7800, b: 4200 },
  ],
  margen_rendimiento: [
    { date: "2024-09-01", a: -3900, b: 0 },
    { date: "2024-10-01", a: -2600, b: 1200 },
    { date: "2024-11-01", a: 7300, b: 8200 },
    { date: "2024-12-01", a: 20200, b: 14900 },
    { date: "2025-01-01", a: 17500, b: 18200 },
    { date: "2025-02-01", a: 11300, b: 20500 },
    { date: "2025-03-01", a: 4400, b: 21800 },
    { date: "2025-04-01", a: 2600, b: 22900 },
    { date: "2025-05-01", a: 1400, b: 23800 },
  ],
  coste_recoleccion_ingreso: [
    { date: "2024-09-01", a: 0, b: 0 },
    { date: "2024-10-01", a: 2100, b: 1400 },
    { date: "2024-11-01", a: 5800, b: 9200 },
    { date: "2024-12-01", a: 7200, b: 22400 },
    { date: "2025-01-01", a: 4900, b: 17600 },
    { date: "2025-02-01", a: 2800, b: 10800 },
    { date: "2025-03-01", a: 1600, b: 5400 },
    { date: "2025-04-01", a: 900, b: 3200 },
    { date: "2025-05-01", a: 600, b: 1800 },
  ],
  subvenciones_gastos: [
    { date: "2024-09-01", a: 1200, b: 3100 },
    { date: "2024-10-01", a: 1200, b: 3400 },
    { date: "2024-11-01", a: 4800, b: 5200 },
    { date: "2024-12-01", a: 4800, b: 6100 },
    { date: "2025-01-01", a: 4800, b: 4800 },
    { date: "2025-02-01", a: 4800, b: 4200 },
    { date: "2025-03-01", a: 4800, b: 3900 },
    { date: "2025-04-01", a: 4800, b: 3600 },
    { date: "2025-05-01", a: 4800, b: 3300 },
  ],
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
  colorA: string
  colorB: string
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
    colorA: "var(--primary)",
    colorB: "var(--destructive)",
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
    colorA: "var(--primary)",
    colorB: "var(--chart-4)",
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
    colorA: "var(--chart-2)",
    colorB: "var(--chart-3)",
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
    colorA: "var(--chart-5)",
    colorB: "var(--primary)",
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
    colorA: "var(--chart-2)",
    colorB: "var(--destructive)",
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
// Helpers
// ---------------------------------------------------------------------------

function formatValue(value: number, unit: string): string {
  if (unit === "€/L") return `${(value / 1000).toFixed(2)} €/L`
  if (unit === "kg/ha") return `${value.toLocaleString("es-ES")} kg/ha`
  return `${value.toLocaleString("es-ES")} €`
}

function formatYAxis(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`
  return `${value}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartAreaInteractive({
  defaultComparison = "ingresos_gastos",
}: {
  defaultComparison?: ComparisonMode
}) {
  const [mode, setMode] = React.useState<ComparisonMode>(defaultComparison)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev)

  const meta = COMPARISONS[mode]
  const data = mockData[mode]

  const chartConfig = {
    a: { label: meta.seriesA, color: meta.colorA },
    b: { label: meta.seriesB, color: meta.colorB },
  } satisfies ChartConfig

  return (
    <Card
      className={cn(
        "@container/card flex h-full flex-col bg-background transition-all duration-300 ease-in-out",
        isFullscreen ? "absolute inset-0 z-50 max-h-screen" : "relative"
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

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
            className="h-8 w-8 shrink-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent
        className={cn(
          "flex min-h-0 flex-1 flex-col justify-end",
          isFullscreen ? "px-6 pt-4 pb-8" : "px-2 pt-4 pb-4 sm:px-6 sm:pt-6"
        )}
      >
        <ChartContainer
          config={chartConfig}
          className={cn(
            "aspect-auto w-full",
            isFullscreen ? "h-full min-h-0 flex-1" : "h-[250px]"
          )}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-a)"
                  stopOpacity={0.85}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-a)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillB" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-b)"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-b)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("es-ES", {
                  month: "short",
                  year: "2-digit",
                })
              }
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={64}
              tickFormatter={formatYAxis}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })
                  }
                  formatter={(value, name) => [
                    formatValue(
                      value as number,
                      name === "a" ? meta.unitA : meta.unitB
                    ),
                    name === "a" ? meta.seriesA : meta.seriesB,
                  ]}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="b"
              type="monotone"
              fill="url(#fillB)"
              stroke="var(--color-b)"
              strokeDasharray="5 3"
              strokeWidth={1.5}
            />
            <Area
              dataKey="a"
              type="monotone"
              fill="url(#fillA)"
              stroke="var(--color-a)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
