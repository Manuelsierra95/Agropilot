'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useParcelStore } from '@/store/useParcelStore'
import { getUserParcels } from '@/lib/parcelData'
import type { Parcel } from '@workspace/types/parcels'

/**
 * Hook para obtener las parcelas del usuario
 */
export function useGetParcels() {
  const parcels = useParcelStore((state) => state.parcels)
  const initParcels = useParcelStore((state) => state.initParcels)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchParcels = useCallback(async () => {
    if (parcels.length > 0) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await getUserParcels()
      if (error) throw new Error(error)
      initParcels(data ?? [])
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar las parcelas'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [parcels.length, initParcels])

  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  return { parcels, isLoading, error }
}
