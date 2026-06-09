"use client"

import { AlertTriangle, Info, ShieldAlert } from "lucide-react"

import type { AlertWidget as AlertWidgetData } from "@workspace/copilot"
import { cn } from "@workspace/ui/lib/utils"

const severityStyles = {
  low: {
    container:
      "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
    icon: Info,
  },
  medium: {
    container:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    icon: AlertTriangle,
  },
  high: {
    container:
      "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
    icon: ShieldAlert,
  },
} as const

export function AlertWidget({ widget }: { widget: AlertWidgetData }) {
  const styles = severityStyles[widget.severity]
  const Icon = styles.icon

  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col gap-3 rounded-xl border p-6",
        styles.container
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-5 shrink-0" aria-hidden />
        <h3 className="text-lg font-semibold">{widget.title}</h3>
      </div>
      <p className="text-sm leading-relaxed">{widget.message}</p>
    </div>
  )
}
