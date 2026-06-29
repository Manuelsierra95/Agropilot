"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
} from "lucide-react"

import type { CampaignTimelineTask } from "@workspace/web/lib/calendar/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    label: "Completado",
    barClass: "bg-emerald-500",
    dotClass: "bg-emerald-500",
    textClass: "text-white",
    badgeVariant: "default" as const,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    strikethrough: true,
  },
  in_progress: {
    label: "En progreso",
    barClass: "bg-blue-500",
    dotClass: "bg-blue-500",
    textClass: "text-white",
    badgeVariant: "default" as const,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    strikethrough: false,
  },
  pending: {
    label: "Pendiente",
    barClass: "bg-slate-400",
    dotClass: "bg-slate-400",
    textClass: "text-white",
    badgeVariant: "default" as const,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    strikethrough: false,
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LegendDot({
  status,
  active,
  onClick,
}: {
  status: "pending" | "in_progress" | "completed"
  active: boolean
  onClick: () => void
}) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 gap-1.5 px-2 text-xs",
        active ? "text-foreground" : "text-muted-foreground/50 line-through"
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full transition-opacity",
          cfg.dotClass,
          !active && "opacity-30"
        )}
      />
      {cfg.label}
    </Button>
  )
}

type CampaignTask = CampaignTimelineTask

function EnhancedTooltipContent({
  task,
  taskMap,
  days,
}: {
  task: CampaignTask
  taskMap: Record<string, CampaignTask>
  days: string[]
}) {
  const cfg = STATUS_CONFIG[task.status]
  const dependsOnTask = task.dependsOn ? taskMap[task.dependsOn] : null
  const startDate = days[task.startDay] || `Día ${task.startDay + 1}`
  const endDate =
    days[task.startDay + task.durationDays - 1] ||
    `Día ${task.startDay + task.durationDays}`

  return (
    <div className="w-64 space-y-3 p-1">
      {/* Header */}
      <div className="space-y-1">
        <h4 className="text-sm leading-tight font-semibold">{task.name}</h4>
        <Badge
          variant="outline"
          className={cn("h-5 text-[10px]", cfg.badgeClass)}
        >
          {cfg.label}
        </Badge>
      </div>

      {/* Dates info */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-3.5" />
          <span>
            {startDate} → {endDate}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-3.5" />
          <span>
            {task.durationDays} día{task.durationDays > 1 ? "s" : ""}
          </span>
        </div>
        {dependsOnTask && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link2 className="size-3.5" />
            <span>Depende de: {dependsOnTask.name}</span>
          </div>
        )}
      </div>

      {/* Note */}
      {task.note && (
        <div className="rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
          {task.note}
        </div>
      )}

      {/* Progress indicator for in_progress */}
      {task.status === "in_progress" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progreso estimado</span>
            <span>50%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-blue-500" />
          </div>
        </div>
      )}
    </div>
  )
}

function TaskBar({
  task,
  totalDays,
  taskMap,
  days,
  columnWidth,
}: {
  task: CampaignTask
  totalDays: number
  taskMap: Record<string, CampaignTask>
  days: string[]
  columnWidth: number
}) {
  const cfg = STATUS_CONFIG[task.status]
  const leftPx = task.startDay * columnWidth
  const widthPx = task.durationDays * columnWidth - 8

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute top-1/2 flex h-7 -translate-y-1/2 cursor-default items-center rounded-md px-2.5 shadow-sm transition-all select-none hover:scale-[1.02] hover:shadow-md",
              cfg.barClass
            )}
            style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
          >
            <span
              className={cn(
                "truncate text-[11px] font-semibold whitespace-nowrap",
                cfg.textClass
              )}
            >
              {task.durationDays}d
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="border bg-popover p-3 text-popover-foreground shadow-lg"
          sideOffset={8}
        >
          <EnhancedTooltipContent task={task} taskMap={taskMap} days={days} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TaskRow({
  task,
  totalDays,
  taskMap,
  days,
  columnWidth,
}: {
  task: CampaignTask
  totalDays: number
  taskMap: Record<string, CampaignTask>
  days: string[]
  columnWidth: number
}) {
  const cfg = STATUS_CONFIG[task.status]
  const dependsOnTask = task.dependsOn ? taskMap[task.dependsOn] : null

  return (
    <div className="flex min-h-[52px] items-center border-b border-border/50 last:border-0">
      {/* Bar area */}
      <div
        className="relative h-full flex-1"
        style={{ minWidth: totalDays * columnWidth }}
      >
        <TaskBar
          task={task}
          totalDays={totalDays}
          taskMap={taskMap}
          days={days}
          columnWidth={columnWidth}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * CampaignTimeline
 */
export function CampaignTimeline({
  tasks,
  todayIndex,
  days,
  title,
}: {
  tasks: CampaignTask[]
  todayIndex: number
  days: string[]
  title: string
}) {
  const totalDays = days.length
  const columnWidth = 80 // px per day
  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]))
  const doneCount = tasks.filter((t) => t.status === "completed").length
  const todayLabel = days[todayIndex]

  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(
    new Set(["completed", "in_progress", "pending"])
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const rowsContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [scrollStartX, setScrollStartX] = useState(0)
  const [scrollStartY, setScrollStartY] = useState(0)

  const visibleDays = Math.floor(viewportWidth / columnWidth) || 7

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      const updateDimensions = () => {
        const newMaxScroll =
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        setMaxScroll(newMaxScroll)
        setViewportWidth(scrollContainer.clientWidth)
      }
      updateDimensions()

      // Scroll to today on mount
      const todayPosition = todayIndex * columnWidth - columnWidth * 2
      scrollContainer.scrollLeft = Math.max(0, todayPosition)
      setScrollPosition(Math.max(0, todayPosition))

      const handleScroll = () => {
        setScrollPosition(scrollContainer.scrollLeft)
      }

      const resizeObserver = new ResizeObserver(updateDimensions)
      resizeObserver.observe(scrollContainer)

      scrollContainer.addEventListener("scroll", handleScroll)
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll)
        resizeObserver.disconnect()
      }
    }
  }, [todayIndex, columnWidth])

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const scrollContainer = scrollRef.current
    const rowsContainer = rowsContainerRef.current
    const leftColumn = leftColumnRef.current
    if (!scrollContainer) return

    setIsDragging(true)
    setStartX(e.pageX)
    setStartY(e.pageY)
    setScrollStartX(scrollContainer.scrollLeft)
    setScrollStartY(rowsContainer?.scrollTop ?? 0)
    scrollContainer.style.cursor = "grabbing"
    scrollContainer.style.userSelect = "none"
    if (rowsContainer) rowsContainer.style.userSelect = "none"
    if (leftColumn) leftColumn.style.userSelect = "none"
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const scrollContainer = scrollRef.current
    const rowsContainer = rowsContainerRef.current
    const leftColumn = leftColumnRef.current
    if (!scrollContainer) return

    e.preventDefault()
    const x = e.pageX
    const y = e.pageY
    const walkX = (startX - x) * 1.5 // Multiply for faster scrolling
    const walkY = (startY - y) * 1.5
    scrollContainer.scrollLeft = scrollStartX + walkX

    // Sync vertical scroll
    if (rowsContainer) rowsContainer.scrollTop = scrollStartY + walkY
    if (leftColumn) leftColumn.scrollTop = scrollStartY + walkY
  }

  const handleMouseUp = () => {
    const scrollContainer = scrollRef.current
    const rowsContainer = rowsContainerRef.current
    const leftColumn = leftColumnRef.current
    if (scrollContainer) {
      scrollContainer.style.cursor = "grab"
      scrollContainer.style.userSelect = ""
    }
    if (rowsContainer) rowsContainer.style.userSelect = ""
    if (leftColumn) leftColumn.style.userSelect = ""
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp()
    }
  }

  const scrollBy = (days: number) => {
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      const newPosition = scrollContainer.scrollLeft + days * columnWidth
      scrollContainer.scrollTo({ left: newPosition, behavior: "smooth" })
    }
  }

  const scrollToTask = (task: CropTask, taskIndex: number) => {
    const scrollContainer = scrollRef.current
    const leftColumn = leftColumnRef.current
    const rowsContainer = rowsContainerRef.current

    if (scrollContainer) {
      // Horizontal scroll to task start day
      const taskPosition = task.startDay * columnWidth - columnWidth
      const clampedPosition = Math.max(0, Math.min(taskPosition, maxScroll))
      scrollContainer.scrollTo({ left: clampedPosition, behavior: "smooth" })
    }

    // Vertical scroll - 52px is the row height
    const rowHeight = 52
    const verticalPosition = taskIndex * rowHeight

    if (leftColumn) {
      leftColumn.scrollTo({ top: verticalPosition, behavior: "smooth" })
    }
    if (rowsContainer) {
      rowsContainer.scrollTo({ top: verticalPosition, behavior: "smooth" })
    }
  }

  const toggleStatus = (status: string) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  const filteredTasks = tasks.filter((t) => activeStatuses.has(t.status))

  return (
    <Card className="overflow-hidden bg-background ring-0">
      {/* ── Header ── */}
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 px-5 py-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex flex-col gap-1 text-sm font-semibold">
            <span>{title}</span>
            <span className="text-xs text-muted-foreground">
              {tasks.length} tareas en {totalDays} días
            </span>
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {doneCount} de {tasks.length} completados
          </span>
          {(["completed", "in_progress", "pending"] as const).map((s) => (
            <LegendDot
              key={s}
              status={s}
              active={activeStatuses.has(s)}
              onClick={() => toggleStatus(s)}
            />
          ))}
        </div>
      </CardHeader>

      {/* ── Timeline grid ── */}
      <CardContent className="px-5 pt-0 pb-3">
        <div className="flex">
          {/* Left label column - fixed */}
          <div className="z-10 w-fit max-w-72 shrink-0 bg-background">
            <div className="h-8" /> {/* Header spacer */}
            <div
              ref={leftColumnRef}
              className="no-scrollbar max-h-[500px] overflow-y-auto"
            >
              {filteredTasks.map((task, index) => {
                const cfg = STATUS_CONFIG[task.status]
                const dependsOnTask = task.dependsOn
                  ? taskMap[task.dependsOn]
                  : null
                return (
                  <Button
                    variant="ghost"
                    key={task.id}
                    onClick={() => scrollToTask(task, index)}
                    className="flex h-auto min-h-[52px] w-full items-center justify-start rounded-none pr-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          cfg.dotClass
                        )}
                      />
                      <div>
                        <span
                          className={cn(
                            "block truncate text-sm font-medium",
                            cfg.strikethrough &&
                              "text-muted-foreground line-through"
                          )}
                        >
                          {task.name}
                        </span>
                        {dependsOnTask && (
                          <p className="truncate text-[10px] text-muted-foreground">
                            ↳ {dependsOnTask.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Scrollable timeline area - drag to scroll */}
          <div
            ref={scrollRef}
            className="no-scrollbar flex-1 cursor-grab overflow-x-auto border-y border-r border-border/30 active:cursor-grabbing"
            style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{ width: totalDays * columnWidth }}>
              {/* Day column headers */}
              <div
                className="grid h-8"
                style={{
                  gridTemplateColumns: `repeat(${totalDays}, ${columnWidth}px)`,
                }}
              >
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-center border-l border-border/30 text-xs first:border-l-0",
                      i === todayIndex
                        ? "bg-primary/5 font-bold text-primary"
                        : "font-normal text-muted-foreground"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Rows + today line */}
              <div
                ref={rowsContainerRef}
                className="relative no-scrollbar max-h-[500px] overflow-y-auto"
              >
                {/* Grid lines - spans full content height */}
                <div
                  className="pointer-events-none absolute grid"
                  style={{
                    gridTemplateColumns: `repeat(${totalDays}, ${columnWidth}px)`,
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${filteredTasks.length * 52}px`,
                  }}
                >
                  {days.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "border-l border-border/30 first:border-l-0",
                        i === todayIndex && "bg-primary/5"
                      )}
                    />
                  ))}
                </div>

                {/* Today line - spans full content height */}
                <div
                  className="pointer-events-none absolute z-10 w-0.5 bg-primary"
                  style={{
                    left: `${(todayIndex + 0.5) * columnWidth}px`,
                    top: 0,
                    height: `${filteredTasks.length * 52}px`,
                  }}
                />

                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    totalDays={totalDays}
                    taskMap={taskMap}
                    days={days}
                    columnWidth={columnWidth}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline navigation */}
        <div className="mt-4 flex items-center justify-end gap-3 px-1">
          <span className="text-xs text-muted-foreground">
            Arrastra para navegar
          </span>
          <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
            Día {Math.max(1, Math.floor(scrollPosition / columnWidth) + 1)} -{" "}
            {Math.min(
              Math.floor(scrollPosition / columnWidth) + visibleDays,
              totalDays
            )}{" "}
            de {totalDays}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default CampaignTimeline
