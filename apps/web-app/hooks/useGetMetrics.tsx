'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useMetricStore } from '@/store/useDashboardMetricStore'
import {
  getParcelLatestMetrics,
  getUserLatestMetrics,
} from '@/lib/dashboardMetricsData'
import { useParcelStore } from '@/store/useParcelStore'

interface UseGetMetricsOptions {
  metricTypes?: string[]
  page?: number
  limit?: number
  forceRefresh?: boolean
  cacheTime?: number
}

/**
 * Hook para obtener las métricas más recientes de una parcela o de todas las parcelas
 */
export function useGetDashboardMetrics(options: UseGetMetricsOptions = {}) {
  const {
    metricTypes = [
      'olive_price',
      'crop_health',
      'yield_estimate',
      'rainfall',
      'current_weather',
      'previous_harvest',
    ],
    page = 1,
    limit = 10,
    forceRefresh = false,
    cacheTime,
  } = options

  const { parcelId } = useParcelStore()
  const { getMetrics, setMetrics, isStale } = useMetricStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(
    async (force: boolean = false) => {
      if (!parcelId) return

      const metrics = getMetrics(parcelId)
      const needsFetch =
        force ||
        Object.keys(metrics).length === 0 ||
        isStale(parcelId, cacheTime)

      if (!needsFetch) return

      setIsLoading(true)
      setError(null)

      try {
        let data, status

        if (parcelId === 'all') {
          const response = await getUserLatestMetrics(metricTypes, {
            page,
            limit,
          })
          data = response.data
          status = response.status
        } else {
          const response = await getParcelLatestMetrics(
            Number(parcelId),
            metricTypes,
            {
              page,
              limit,
            }
          )
          data = response.data
          status = response.status
        }

        setMetrics(data, parcelId)
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar las métricas'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [
      parcelId,
      getMetrics,
      isStale,
      cacheTime,
      metricTypes,
      page,
      limit,
      setMetrics,
    ]
  )

  useEffect(() => {
    fetchMetrics(forceRefresh)
  }, [parcelId, forceRefresh])

  // Función para forzar una recarga manual
  const refetch = useCallback(() => {
    return fetchMetrics(true)
  }, [fetchMetrics])

  return { isLoading, error, refetch }
}
