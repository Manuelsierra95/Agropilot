'use client'

import { useState } from 'react'
import { deleteParcel } from '@/lib/parcelData'
import { useParcelStore } from '@/store/useParcelStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { toast } from 'sonner'

interface DeleteParcelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parcelId?: number
  parcelName?: string
  onDeleteSuccess?: () => void
}

export function DeleteParcel({
  open,
  onOpenChange,
  parcelId,
  parcelName,
  onDeleteSuccess,
}: DeleteParcelProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const parcels = useParcelStore((state) => state.parcels)
  const setParcels = useParcelStore((state) => state.setParcels)
  const setParcelId = useParcelStore((state) => state.setParcelId)

  const handleDelete = async () => {
    if (!parcelId) {
      toast.error('No hay parcela seleccionada')
      return
    }

    setIsDeleting(true)

    try {
      await deleteParcel(parcelId)

      const updatedParcels = parcels.filter((p) => p.id !== parcelId)
      setParcels(updatedParcels)

      if (updatedParcels.length > 0 && updatedParcels[0]) {
        setParcelId(updatedParcels[0].id?.toString() || null)
      } else {
        setParcelId(null)
      }

      toast.success('Parcela eliminada exitosamente')

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error al eliminar la parcela:', error)
      toast.error('Error al eliminar la parcela. Por favor, intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">
            ¿Estás seguro?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Esta acción no se puede deshacer. Esto eliminará permanentemente la
            parcela{' '}
            {parcelName && (
              <span className="font-semibold">&quot;{parcelName}&quot;</span>
            )}{' '}
            y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="w-full sm:w-auto m-0"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
