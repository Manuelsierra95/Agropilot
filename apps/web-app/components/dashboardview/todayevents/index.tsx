'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import type { Event } from '@/lib/calendarData'
import { Badge } from '@workspace/ui/components/badge'
import { AddEventModal } from './AddEventModal'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'
import { useTodayEventStore } from '@/store/useTodayEventStore'
import { useParcelStore } from '@/store/useParcelStore'
import { useGetTodayEvents } from '@/hooks/useGetTodayEvents'
import { DataLoader } from '@/components/loaders/DataLoader'

export function EventsList() {
  const { isLoading } = useGetTodayEvents()
  const { parcelId } = useParcelStore()
  const { getEvents, addEvent } = useTodayEventStore()
  const events = parcelId ? getEvents(parcelId) : []
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
    if (!parcelId) return
    const id = Date.now().toString()
    const newEventWithId = { ...newEvent, id }
    addEvent(newEventWithId, parcelId)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const todayEvents = useMemo(() => {
    return events.sort((a, b) => {
      const aTime =
        typeof a.startTime === 'string' ? new Date(a.startTime) : a.startTime
      const bTime =
        typeof b.startTime === 'string' ? new Date(b.startTime) : b.startTime
      return aTime.getTime() - bTime.getTime()
    })
  }, [events])

  return (
    <Card className="h-[45vh] flex flex-col col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-4">
      <CardHeader className="flex-shrink-0 mb-[-18px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              Eventos de Hoy
            </CardTitle>
            <AddEventModal
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              onAddEvent={handleAddEvent}
            />
          </div>
          <Badge variant="secondary" className="h-5 px-2 text-xs">
            {todayEvents.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-1 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto divide-y divide-muted-foreground/10">
          {isLoading ? (
            <DataLoader message="Cargando eventos de hoy..." />
          ) : todayEvents.length > 0 ? (
            todayEvents.map((event) => {
              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {/* Header with category and title */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.category}
                    </span>
                    <span className="font-medium text-sm">{event.title}</span>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="text-xs text-muted-foreground pl-1">
                      {event.description}
                    </div>
                  )}

                  {/* Time and duration */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pl-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(event.startTime)} -{' '}
                        {formatTime(event.endTime)}
                      </span>
                    </div>
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {event.tags.map((tag) => (
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
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay eventos programados para hoy
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
