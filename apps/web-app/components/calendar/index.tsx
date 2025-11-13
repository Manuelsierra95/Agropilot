'use client'

import { useMemo } from 'react'
import { EventManager } from '@workspace/ui/components/event-manager'
import { useCalendarEventStore } from '@/store/useCalendarEventStore'
import { useParcelStore } from '@/store/useParcelStore'
import { useGetEvents } from '@/hooks/useGetEvents'
import { DataLoader } from '@/components/loaders/DataLoader'

export default function Calendar() {
  const { isLoading } = useGetEvents()
  const { parcelId } = useParcelStore()
  const { getEvents } = useCalendarEventStore()
  const events = parcelId ? getEvents(parcelId) : []

  const normalizedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      startTime:
        typeof event.startTime === 'string'
          ? new Date(event.startTime)
          : event.startTime,
      endTime:
        typeof event.endTime === 'string'
          ? new Date(event.endTime)
          : event.endTime,
    }))
  }, [events])

  if (isLoading && events.length === 0)
    return <DataLoader message="Cargando eventos..." size="lg" />

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <EventManager
        events={normalizedEvents}
        onEventCreate={(event) => console.log('Created:', event)}
        onEventUpdate={(id, event) => console.log('Updated:', id, event)}
        onEventDelete={(id) => console.log('Deleted:', id)}
        categories={[
          'Reunión',
          'Tarea',
          'Recordatorio',
          'Personal',
          'Clima',
          'Mantenimiento',
          'Sanidad',
          'Seguridad',
          'Otro',
        ]}
        availableTags={[
          'Importante',
          'Urgente',
          'Trabajo',
          'Personal',
          'Equipo',
          'Cliente',
          'Importante',
          'Urgente',
          'Clima',
          'Riego',
          'Fertilización',
          'Seguridad',
        ]}
        defaultView="month"
      />
    </div>
  )
}
