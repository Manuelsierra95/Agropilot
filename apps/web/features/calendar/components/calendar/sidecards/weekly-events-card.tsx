"use client"

import * as React from "react"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, Clock } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import type { CalendarEvent } from "@workspace/web/types/calendar-types"
import { eventTypeConfig } from "@workspace/web/types/calendar-types"

interface WeeklyEventsCardProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function WeeklyEventsCard({
  events,
  onEventClick,
}: WeeklyEventsCardProps) {
  const now = new Date()
  const nextWeek = addDays(now, 7)

  const upcomingEvents = events
    .filter(
      (event) =>
        !event.completed &&
        isAfter(new Date(event.date), now) &&
        isBefore(new Date(event.date), nextWeek)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const overdueEvents = events.filter(
    (event) => !event.completed && isBefore(new Date(event.date), now)
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Próximos Eventos</CardTitle>
        <CardDescription>
          Tareas programadas para los próximos 7 días
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueEvents.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm">
              <span className="font-medium">{overdueEvents.length}</span> evento
              {overdueEvents.length > 1 ? "s" : ""} atrasado
              {overdueEvents.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay eventos próximos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const config = eventTypeConfig[event.type]
              const eventDate = new Date(event.date)
              const daysUntil = Math.ceil(
                (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={event.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg">
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(eventDate, "d 'de' MMMM", { locale: es })}
                      {event.parcela && ` • ${event.parcela}`}
                    </p>
                  </div>
                  <Badge
                    variant={daysUntil <= 1 ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {daysUntil === 0
                      ? "Hoy"
                      : daysUntil === 1
                        ? "Mañana"
                        : `${daysUntil} días`}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
