'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useParcelStore } from '@/store/useParcelStore'
import { cn } from '@workspace/ui/lib/utils'
import { useGetParcels } from '@/hooks/useGetParcels'

export function ParcelSelector({ className }: { className?: string }) {
  const { parcels, isLoading } = useGetParcels()
  const parcelId = useParcelStore((s) => s.parcelId)
  const setParcelId = useParcelStore((s) => s.setParcelId)
  const selectAllParcels = useParcelStore((s) => s.selectAllParcels)

  if (isLoading || !parcelId) {
    return (
      <div className={cn('space-y-2 overflow-hidden', className)}>
        <div className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
          <span className="text-muted-foreground">
            {isLoading ? 'Cargando parcelas...' : 'Cargando...'}
          </span>
        </div>
      </div>
    )
  }

  const handleValueChange = (value: string) => {
    if (value === 'all') {
      selectAllParcels()
    } else {
      setParcelId(value)
    }
  }

  const displayValue =
    parcelId === 'all'
      ? 'Todas las parcelas'
      : parcels.find((p) => p.id?.toString() === parcelId)?.name

  return (
    <div className={cn('space-y-2 overflow-hidden', className)}>
      <Select value={parcelId ?? undefined} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full focus-visible:ring-0">
          <SelectValue
            placeholder={
              parcels.length === 0
                ? 'No se ha seleccionado ninguna parcela'
                : 'Selecciona una parcela'
            }
          >
            {displayValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {parcels.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No existen parcelas
            </div>
          ) : (
            <>
              {parcels.map((parcel) => (
                <SelectItem key={parcel.id} value={parcel.id?.toString() || ''}>
                  {parcel.name}
                </SelectItem>
              ))}
              <SelectItem value="all" className="text-slate-500">
                Seleccionar todo
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
