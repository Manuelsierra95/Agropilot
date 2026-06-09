"use client"

import { useState } from "react"
import { ChevronDown, Loader2, Minus } from "lucide-react"

import type {
  ProcessStep,
  ProcessStepStatus,
  TaskProgressData,
} from "@workspace/copilot"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

const STATUS_LABELS: Record<ProcessStepStatus, string> = {
  pending: "Pendiente",
  running: "En curso",
  done: "Hecho",
  skipped: "Omitido",
}

function StepIcon({ status }: { status: ProcessStepStatus }) {
  if (status === "running") {
    return (
      <span className="flex size-4 items-center justify-center rounded-[4px] border border-primary/40 bg-primary/10">
        <Loader2 className="size-2.5 animate-spin text-primary" />
      </span>
    )
  }

  if (status === "done") {
    return (
      <span className="flex size-4 items-center justify-center rounded-[4px] border border-emerald-500/40 bg-emerald-500/15 text-[10px] font-bold text-emerald-400">
        ✓
      </span>
    )
  }

  if (status === "skipped") {
    return (
      <span className="flex size-4 items-center justify-center rounded-[4px] border border-violet-500/40 bg-violet-500/15 text-violet-400">
        <Minus className="size-2.5" />
      </span>
    )
  }

  return (
    <span className="size-4 rounded-[4px] border border-border/80 bg-muted/30" />
  )
}

function statusTextClass(status: ProcessStepStatus) {
  switch (status) {
    case "done":
      return "text-emerald-400"
    case "skipped":
      return "text-violet-400"
    case "running":
      return "text-primary"
    default:
      return "text-muted-foreground"
  }
}

function ProcessStepRow({ step }: { step: ProcessStep }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/50 py-2.5 first:border-t-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <StepIcon status={step.status} />
        <span className="truncate text-sm text-foreground">{step.label}</span>
        {step.badge ? (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {step.badge}
          </Badge>
        ) : null}
      </div>
      <span
        className={cn(
          "shrink-0 text-xs font-medium",
          statusTextClass(step.status)
        )}
      >
        {STATUS_LABELS[step.status]}
      </span>
    </div>
  )
}

export function TaskProgressCard({
  progress,
  isStreaming,
}: {
  progress: TaskProgressData
  isStreaming?: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const runningLabel =
    progress.phase === "complete"
      ? "Completado"
      : progress.phase === "error"
        ? "Error"
        : "Ejecutando…"

  return (
    <div className="w-full max-w-full rounded-2xl border border-border/80 bg-muted/20 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {progress.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {isStreaming && progress.phase === "running"
            ? "Generando…"
            : progress.subtitle}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-border/60 bg-background/60">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {runningLabel}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded ? (
          <div className="px-3 pb-2">
            {progress.steps.map((step) => (
              <ProcessStepRow key={step.id} step={step} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function StatusLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
      <span className="size-1.5 rounded-full bg-violet-500" />
      <span>{text}</span>
    </div>
  )
}
