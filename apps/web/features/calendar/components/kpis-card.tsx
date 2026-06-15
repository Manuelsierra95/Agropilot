"use client"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendValue,
} from "@workspace/ui/components/charts/legend"
import { RingChart, Ring, RingCenter } from "@workspace/ui/components/charts"
import { BarChart3 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@workspace/ui/components/badge"

// ── theme colors desde global.css ──────────────────────────────────────────────

const taskColors = {
  pending: {
    light: { text: "var(--task-pending-text)" },
    dark: { text: "var(--task-pending-text)" },
  },
  in_progress: {
    light: { text: "var(--task-inprogress-text)" },
    dark: { text: "var(--task-inprogress-text)" },
  },
  completed: {
    light: { text: "var(--task-completed-text)" },
    dark: { text: "var(--task-completed-text)" },
  },
}

function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

// ── types ──────────────────────────────────────────────────────────────────────

export type EventStatus = "pending" | "in_progress" | "completed"

export interface CalendarEvent {
  id: string
  title: string
  start: string | Date
  end: string | Date
  parcelName: string
  status: EventStatus
  meta?: { priority?: "low" | "medium" | "high"; [key: string]: unknown }
}

export interface KpiData {
  weekTasks: number
  weekCompleted: number
  weekInProgress: number
  weekPending: number
  delayed: number
}

// ── derivation ─────────────────────────────────────────────────────────────────

export function deriveKpis(events: CalendarEvent[]): KpiData {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekEvents = events.filter((e) => {
    const start = new Date(e.start)
    return start >= weekStart && start <= weekEnd
  })

  return {
    weekTasks: weekEvents.length,
    weekCompleted: weekEvents.filter((e) => e.status === "completed").length,
    weekInProgress: weekEvents.filter((e) => e.status === "in_progress").length,
    weekPending: weekEvents.filter((e) => e.status === "pending").length,
    delayed: events.filter(
      (e) => new Date(e.end) < now && e.status !== "completed"
    ).length,
  }
}

// ── helpers ────────────────────────────────────────────────────────────────────

function buildRings(kpis: KpiData) {
  const theme = getTheme()

  return [
    {
      label: "Completadas",
      value: kpis.weekCompleted,
      maxValue: kpis.weekTasks,
      color: taskColors.completed[theme].text,
    },
    {
      label: "En progreso",
      value: kpis.weekInProgress,
      maxValue: kpis.weekTasks,
      color: taskColors.in_progress[theme].text,
    },
    {
      label: "Pendientes",
      value: kpis.weekPending,
      maxValue: kpis.weekTasks,
      color: taskColors.pending[theme].text,
    },
  ]
}

// ── component ──────────────────────────────────────────────────────────────────

interface KpisCardProps {
  events?: CalendarEvent[]
  kpis?: KpiData
}

export function KpisCard({ events = [], kpis: kpisProp }: KpisCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const kpis = kpisProp ?? deriveKpis(events)
  const pct =
    kpis.weekTasks > 0
      ? Math.round((kpis.weekCompleted / kpis.weekTasks) * 100)
      : 0
  const rings = buildRings(kpis)

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden bg-background pt-0 ring-0">
      {/* Header */}
      <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium tracking-tight">
            KPIs semanales
          </span>
        </div>
        <Badge
          variant="destructive"
          className="h-5 rounded-sm px-1.5 text-[10px] font-medium tabular-nums"
        >
          {kpis.delayed} retrasada{kpis.delayed !== 1 ? "s" : ""}
        </Badge>
      </CardHeader>

      {/* Body */}
      <CardContent className="min-h-0 flex-1 p-0">
        {kpis.weekTasks === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <BarChart3 className="size-5 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Sin tareas esta semana
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center divide-x divide-border">
            <div className="flex min-w-0 flex-1 items-center justify-center gap-4 px-4 py-5">
              <RingChart
                data={rings}
                size={240}
                ringGap={10}
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
              >
                {rings.map((item, i) => (
                  <Ring key={item.label} index={i} />
                ))}
                <RingCenter defaultLabel={`${pct}%`} />
              </RingChart>

              <div className="min-w-0 flex-1">
                <Legend
                  items={rings}
                  hoveredIndex={hoveredIndex}
                  onHoverChange={setHoveredIndex}
                  title="Estado de tareas"
                >
                  <LegendItem className="flex flex-row flex-nowrap items-center gap-2 whitespace-nowrap">
                    <LegendMarker />
                    <LegendLabel className="min-w-0 truncate" />
                    <LegendValue className="ml-auto shrink-0 tabular-nums" />
                  </LegendItem>
                </Legend>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
