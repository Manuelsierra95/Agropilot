"use client"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import type { DashboardOlivar } from "@workspace/schemas"

import { useDashboardScopeActions } from "@workspace/web/hooks/use-dashboard-scope-actions"

export type ParcelCropOverviewItem = {
  parcelId: string
  name: string
} & DashboardOlivar

type ResumeCropAllProps = {
  className?: string
  items: ParcelCropOverviewItem[]
}

export function ResumeCropAll({ className, items }: ResumeCropAllProps) {
  const { selectParcel } = useDashboardScopeActions()

  return (
    <Card
      className={cn(
        "@container/resume-crop w-full min-w-0 bg-background ring-0",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Estado del cultivo</CardTitle>
        <CardDescription className="text-xs">
          Fases, rendimiento e indicadores por parcela
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 pb-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Sin datos de parcelas.
          </p>
        ) : (
          <ScrollArea className="max-h-[180px] @min-[1100px]/main:max-h-[220px]">
            <ul className="divide-y divide-border/40 pr-3">
              {items.map((item) => {
                const yieldPerTree =
                  item.totalTrees > 0 ? item.totalYieldKg / item.totalTrees : 0
                const tempPositive = item.temperatureChange >= 0

                return (
                  <li key={item.parcelId}>
                    <button
                      type="button"
                      onClick={() => void selectParcel(item.parcelId)}
                      className="flex w-full flex-col gap-2 py-2.5 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.phenologicalStage}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-right">
                          <span className="text-sm font-medium tabular-nums">
                            {item.temperature}°C
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 px-1.5 text-[10px] tabular-nums",
                              tempPositive ? "text-emerald-600" : "text-sky-600"
                            )}
                          >
                            {tempPositive ? "+" : ""}
                            {item.temperatureChange}°
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs @min-[1100px]/main:grid-cols-4">
                        <Metric
                          label="Rendimiento"
                          value={`${yieldPerTree.toFixed(1)} kg/árbol`}
                        />
                        <Metric label="Kc" value={String(item.kc)} />
                        <Metric
                          label="Balance hídrico"
                          value={`${item.waterBalance}%`}
                        />
                        <Metric
                          label="GDD"
                          value={`${item.gdd}/${item.gddTarget}`}
                        />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  )
}
