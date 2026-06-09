"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { KpiWidget as KpiWidgetData } from "@workspace/copilot"

export function KpiWidget({ widget }: { widget: KpiWidgetData }) {
  return (
    <Card className="flex min-h-[200px] flex-col bg-background ring-0">
      <CardHeader>
        <CardTitle className="text-base">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <p className="text-4xl font-semibold tracking-tight">
          {widget.value}
          {widget.unit ? (
            <span className="ml-2 text-lg font-normal text-muted-foreground">
              {widget.unit}
            </span>
          ) : null}
        </p>
        {widget.delta ? (
          <p className="mt-2 text-sm text-muted-foreground">{widget.delta}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
