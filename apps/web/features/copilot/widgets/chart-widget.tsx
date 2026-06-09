"use client"

import {
  Area,
  ChartTooltip,
  ComposedChart,
  curveCatmullRom,
  Grid,
  Line,
  SeriesBar,
  XAxis,
} from "@workspace/ui/components/charts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { ChartView } from "@workspace/copilot"
import type { ChartWidget as ChartWidgetData } from "@workspace/copilot"

const smooth = curveCatmullRom.alpha(0.42)

function chartInstanceKey(view: ChartView) {
  const seriesKeys = view.series.map((series) => series.dataKey).join("|")
  const firstDate = String(view.rows[0]?.date ?? "")
  const lastDate = String(view.rows.at(-1)?.date ?? "")
  return `${view.title}::${seriesKeys}::${firstDate}::${lastDate}::${view.rows.length}`
}

export function ChartWidget({ widget }: { widget: ChartWidgetData }) {
  const { view } = widget

  return (
    <Card className="@container/card flex min-h-[420px] flex-col bg-background ring-0">
      <CardHeader>
        <CardTitle>{view.title}</CardTitle>
        {view.description ? (
          <CardDescription>{view.description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col justify-end">
        {view.series.length > 0 && view.rows.length > 0 ? (
          <ComposedChart
            key={chartInstanceKey(view)}
            data={view.rows}
            xDataKey={view.xDataKey}
            aspectRatio="2 / 1"
            barGap={0}
            maxBarSize={32}
          >
            <Grid horizontal />
            {view.series.map((series, index) => {
              const seriesKey = `${series.dataKey}-${index}`

              if (series.kind === "area") {
                return (
                  <Area
                    key={seriesKey}
                    dataKey={series.dataKey}
                    curve={smooth}
                    fill={series.color ?? "var(--chart-4)"}
                    fillOpacity={0.32}
                  />
                )
              }

              if (series.kind === "bar") {
                return (
                  <SeriesBar
                    key={seriesKey}
                    dataKey={series.dataKey}
                    fill={series.color ?? "var(--chart-3)"}
                    radius={4}
                  />
                )
              }

              return (
                <Line
                  key={seriesKey}
                  dataKey={series.dataKey}
                  curve={smooth}
                  stroke={series.color ?? "var(--chart-1)"}
                  strokeWidth={2.5}
                />
              )
            })}
            <ChartTooltip
              showCrosshair={false}
              rows={(point) =>
                view.series.map((series, index) => ({
                  color: series.color ?? `var(--chart-${(index % 5) + 1})`,
                  label: series.label,
                  value: String(point[series.dataKey] ?? "—"),
                }))
              }
            />
            <XAxis numTicks={8} />
          </ComposedChart>
        ) : (
          <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No hay datos para el gráfico.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
