"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import type { Event } from "@/store/mockEvents"
import { Clock, Calendar as CalendarIcon } from "lucide-react"
// import { useEventStore } from "@/store/useEventStore"
// import { useGetTodayEvents } from "@/hooks/useGetTodayEvents"
// import { useParcelStore } from "@/store/useParcelStore"

import { mockEvents } from "@/store/mockEvents"

export function EventsList() {
  // const { isLoading } = useGetTodayEvents()
  // const { parcelId } = useParcelStore()
  // const { getEvents, addEvent } = useEventStore()
  // const events = parcelId ? getEvents(parcelId) : []
  // const [isDialogOpen, setIsDialogOpen] = useState(false)

  // const handleAddEvent = (newEvent: Omit<Event, "id">) => {
  //   if (!parcelId) return
  //   const id = Date.now().toString()
  //   const newEventWithId = { ...newEvent, id }
  //   addEvent(newEventWithId, parcelId)
  // }

  // Usar mockEvents directamente
  const events: Event[] = mockEvents
  const isLoading = false

  // const formatDate = (date: Date | string) => {
  //   const dateObj = typeof date === "string" ? new Date(date) : date
  //   return dateObj.toLocaleDateString("es-ES", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //   })
  // }

  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const todayEvents = useMemo(() => {
    return events.sort((a: Event, b: Event) => {
      const aTime =
        typeof a.startTime === "string" ? new Date(a.startTime) : a.startTime
      const bTime =
        typeof b.startTime === "string" ? new Date(b.startTime) : b.startTime
      return aTime.getTime() - bTime.getTime()
    })
  }, [events])

  return (
    <Card className="col-span-1 flex h-[65vh] w-full flex-col sm:col-span-1 md:col-span-4 md:h-[45vh] lg:col-span-4">
      <CardHeader className="shrink-0 py-0">
        <div className="flex items-center justify-start gap-2">
          <CardTitle className="p-0 text-sm font-medium">
            Eventos de Hoy
          </CardTitle>
          <Badge variant="secondary" className="h-5 rounded-full text-xs">
            {todayEvents.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-0.5">
        <ScrollArea className="h-full w-full">
          <div className="divide-y divide-muted-foreground/10">
            {isLoading ? (
              <DataLoader message="Cargando eventos de hoy..." />
            ) : todayEvents.length > 0 ? (
              todayEvents.map((event: Event) => {
                return (
                  <div
                    key={event.id}
                    className="flex cursor-pointer flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    {/* Header with category and title */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.category}
                      </span>
                      <span className="text-sm font-medium">{event.title}</span>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div className="pl-1 text-xs text-muted-foreground">
                        {event.description}
                      </div>
                    )}

                    {/* Time and duration */}
                    <div className="flex items-center gap-3 pl-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(event.startTime)} -{" "}
                          {formatTime(event.endTime)}
                        </span>
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {event.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="h-4 px-1.5 text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
                <CalendarIcon className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No hay eventos programados para hoy
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
