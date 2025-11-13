'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useParcelStore } from '@/store/useParcelStore'
import { apiClient } from '@/lib/apiClient'
import type { Parcel } from '@workspace/types/parcels'

/**
 * Hook para obtener las parcelas del usuario
 */
export function useGetParcels() {
  const parcels = useParcelStore((state) => state.parcels)
  const initParcels = useParcelStore((state) => state.initParcels)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParcels = async () => {
      if (parcels.length > 0) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<{ data: Parcel[] }>('/parcels')
        initParcels(response.data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar las parcelas'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchParcels()
  }, [parcels.length, initParcels])

  return { parcels, isLoading, error }
}
