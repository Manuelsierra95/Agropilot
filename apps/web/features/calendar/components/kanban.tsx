"use client"

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@workspace/ui/components/kibo-ui/kanban"
import type {
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
} from "@/lib/calendar/types"
import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"

type KanbanColumnId = CalendarEventStatus
type FilterRange = "day" | "week" | "month"

type KanbanColumn = { id: KanbanColumnId; name: string }

type KanbanCardData = {
  id: string
  name: string
  startAt: Date
  endAt: Date
  column: KanbanColumnId
  parcelName: string
  eventType: CalendarEventType
}

const columns: KanbanColumn[] = [
  { id: "pending", name: "Pendiente" },
  { id: "in_progress", name: "En progreso" },
  { id: "completed", name: "Completado" },
]

const columnStyles: Record<KanbanColumnId, { dot: string; badge: string }> = {
  pending: {
    dot: "bg-muted-foreground/40",
    badge: "bg-muted text-muted-foreground",
  },
  in_progress: {
    dot: "bg-foreground/70",
    badge: "bg-foreground/10 text-foreground",
  },
  completed: {
    dot: "bg-foreground",
    badge: "bg-foreground/15 text-foreground",
  },
}

const toKanbanCards = (events: CalendarEvent[]): KanbanCardData[] =>
  events.map((event) => ({
    id: event.id,
    name: event.title,
    startAt: event.start,
    endAt: event.end,
    column: event.status,
    parcelName: event.parcelName,
    eventType: event.type,
  }))

const shortDateFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  day: "numeric",
})

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function getFilterRange(range: FilterRange): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (range === "day") {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (range === "week") {
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    start.setDate(now.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } else {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setMonth(now.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

function filterCardsByRange(
  cards: KanbanCardData[],
  range: FilterRange
): KanbanCardData[] {
  const { start, end } = getFilterRange(range)
  return cards.filter((card) => card.startAt >= start && card.startAt <= end)
}

function getRangeLabel(range: FilterRange): string {
  const now = new Date()
  if (range === "day") {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }).format(now)
  }
  if (range === "week") {
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
    })
    return `${fmt.format(monday)} – ${fmt.format(sunday)}`
  }
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(now)
}

const filterLabels: Record<FilterRange, string> = {
  day: "Hoy",
  week: "Semana",
  month: "Mes",
}

type KanbanProps = { events: CalendarEvent[] }

export function Kanban({ events }: KanbanProps) {
  const [cards, setCards] = useState<KanbanCardData[]>(() =>
    toKanbanCards(events)
  )
  const [filter, setFilter] = useState<FilterRange>("day")

  useEffect(() => {
    setCards(toKanbanCards(events))
  }, [events])

  const filteredCards = useMemo(
    () => filterCardsByRange(cards, filter),
    [cards, filter]
  )

  const rangeLabel = useMemo(() => getRangeLabel(filter), [filter])
  const totalCount = filteredCards.length

  return (
    <Card className="h-full bg-background pt-0 ring-0">
      <CardHeader className="flex items-center justify-between gap-4 px-4 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground capitalize">
            {rangeLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {totalCount === 0
              ? "Sin tareas"
              : `${totalCount} tarea${totalCount !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="flex w-fit items-center gap-0.5 rounded-lg bg-muted/60 p-1">
          {(["day", "week", "month"] as FilterRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setFilter(range)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                filter === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filterLabels[range]}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <KanbanProvider<KanbanCardData, KanbanColumn>
          columns={columns}
          data={cards}
          onDataChange={setCards}
          className="gap-3 px-0.5"
        >
          {(column) => {
            const styles = columnStyles[column.id]
            const visibleCards = filteredCards.filter(
              (c) => c.column === column.id
            )
            const count = visibleCards.length

            return (
              <KanbanBoard
                id={column.id}
                key={column.id}
                className="h-full min-h-0 overflow-auto border-border/30 bg-background shadow-none"
              >
                <KanbanHeader className="border-boder/30 sticky top-0 z-10 border-b bg-background px-3 py-2.5">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {column.name}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ${styles.badge}`}
                    >
                      {count}
                    </span>
                  </div>
                </KanbanHeader>

                <KanbanCards
                  id={column.id}
                  className="flex flex-col gap-1.5 p-2"
                >
                  {(card: KanbanCardData) => {
                    if (!filteredCards.some((c) => c.id === card.id)) {
                      return null
                    }

                    return (
                      <KanbanCard
                        column={column.id}
                        id={card.id}
                        key={card.id}
                        name={card.name}
                        className="group cursor-grab rounded-md bg-muted-foreground/5 px-3 py-2.5 shadow-none transition-colors hover:border-border hover:bg-muted/40 active:cursor-grabbing"
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className="m-0 text-sm leading-snug font-medium text-foreground">
                            {card.name}
                          </p>
                          <p className="m-0 text-xs text-muted-foreground">
                            {card.parcelName}
                          </p>
                        </div>
                        <p className="m-0 mt-2 text-xs text-muted-foreground/70 tabular-nums">
                          {shortDateFormatter.format(card.startAt)}
                          {" — "}
                          {dateFormatter.format(card.endAt)}
                        </p>
                      </KanbanCard>
                    )
                  }}
                </KanbanCards>
              </KanbanBoard>
            )
          }}
        </KanbanProvider>
      </CardContent>
      <CardFooter className="border-border/30 bg-background p-2">
        <span className="text-xs text-muted-foreground">
          Arrastra y suelta las tareas para actualizar su estado.
        </span>
      </CardFooter>
    </Card>
  )
}
