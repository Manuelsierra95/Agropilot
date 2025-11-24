'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTodayEventStore } from '@/store/useTodayEventStore'
import { useParcelStore } from '@/store/useParcelStore'
import { getTodayParcelEvents } from '@/lib/calendarData'
import type { Event } from '@/lib/calendarData'

interface UseGetTodayEventsOptions {
  forceRefresh?: boolean
  cacheTime?: number
}

export function useGetTodayEvents(options: UseGetTodayEventsOptions = {}) {
  const { forceRefresh = false, cacheTime } = options
  const { parcelId } = useParcelStore()
  const { getEvents, setEvents, isStale } = useTodayEventStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTodayEvents = useCallback(
    async (force: boolean = false) => {
      if (!parcelId) return

      const events = getEvents(parcelId)
      const needsFetch =
        force || events.length === 0 || isStale(parcelId, cacheTime)

      if (!needsFetch) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, status, error } = await getTodayParcelEvents(
          parcelId === 'all' ? 'all' : Number(parcelId)
        )

        // if (status === 404) toast.info(error ?? 'No hay eventos para hoy')

        if (data === undefined)
          throw new Error(error || 'Datos de eventos no disponibles')

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
      } catch (err: any) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al cargar los eventos de hoy'
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
    fetchTodayEvents(forceRefresh)
  }, [parcelId, forceRefresh])

  // Función para forzar una recarga manual
  const refetch = useCallback(() => {
    return fetchTodayEvents(true)
  }, [fetchTodayEvents])

  return { isLoading, error, refetch }
}
