'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useCalendarEventStore } from '@/store/useCalendarEventStore'
import { useParcelStore } from '@/store/useParcelStore'
import { getAllParcelEvents } from '@/lib/calendarData'
import type { Event } from '@/lib/calendarData'

interface UseGetEventsOptions {
  forceRefresh?: boolean
  cacheTime?: number
}

export function useGetEvents(options: UseGetEventsOptions = {}) {
  const { forceRefresh = false, cacheTime } = options
  const { parcelId } = useParcelStore()
  const { getEvents, setEvents, isStale } = useCalendarEventStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(
    async (force: boolean = false) => {
      if (!parcelId) return

      const events = getEvents(parcelId)
      const needsFetch =
        force || events.length === 0 || isStale(parcelId, cacheTime)

      if (!needsFetch) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await getAllParcelEvents(
          parcelId === 'all' ? 'all' : Number(parcelId)
        )

        const transformedEvents: Event[] = data.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          description: event.description || '',
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          color: event.color,
          category: event.category,
          tags: event.tags || [],
        }))

        setEvents(transformedEvents, parcelId)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar los eventos'
        setError(errorMessage)
        toast.error(errorMessage)
        setEvents([], parcelId)
      } finally {
        setIsLoading(false)
      }
    },
    [parcelId, getEvents, isStale, cacheTime, setEvents]
  )

  useEffect(() => {
    fetchEvents(forceRefresh)
  }, [parcelId, forceRefresh])

  // Función para forzar una recarga manual
  const refetch = useCallback(() => {
    return fetchEvents(true)
  }, [fetchEvents])

  return { isLoading, error, refetch }
}
