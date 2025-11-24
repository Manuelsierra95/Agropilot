'use client'

import { useState } from 'react'
import type { ParcelInsert } from '@workspace/types/parcels'
import { createParcel } from '@/lib/parcelData'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Plus, Trash2, TreePine } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { toast } from 'sonner'

interface CreateParcelProps {
  trigger: React.ReactNode
  onSubmit?: (parcel: ParcelInsert) => void
}

interface Coordinate {
  x: string
  y: string
}

export function CreateParcel({ trigger, onSubmit }: CreateParcelProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    type: '',
    irrigationType: '',
    description: '',
  })
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    { x: '', y: '' },
    { x: '', y: '' },
    { x: '', y: '' },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que haya al menos 3 puntos para formar un polígono
    if (coordinates.length < 3) {
      toast.error('Se necesitan al menos 3 puntos para formar un polígono')
      return
    }

    setIsSubmitting(true)

    try {
      // Convertir coordenadas a formato GeoJSON
      const geoCoordinates: number[][] = coordinates.map((coord) => [
        parseFloat(coord.x),
        parseFloat(coord.y),
      ])

      // Cerrar el polígono (el último punto debe ser igual al primero)
      const firstPoint = geoCoordinates[0]
      const lastPoint = geoCoordinates[geoCoordinates.length - 1]
      if (
        firstPoint &&
        lastPoint &&
        (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])
      ) {
        geoCoordinates.push([...firstPoint])
      }

      const parcelData: ParcelInsert = {
        name: formData.name,
        area: parseFloat(formData.area) || null,
        type: formData.type || null,
        irrigationType: formData.irrigationType || null,
        geometryType: 'Polygon',
        geometryCoordinates: [geoCoordinates],
        description: formData.description || null,
      }

      const { data, error, status } = await createParcel(parcelData)

      if (error) throw new Error(error)

      if (onSubmit) {
        onSubmit(parcelData)
      }

      toast.success('¡Parcela creada exitosamente!')

      setOpen(false)
      setFormData({
        name: '',
        area: '',
        type: '',
        irrigationType: '',
        description: '',
      })
      setCoordinates([
        { x: '', y: '' },
        { x: '', y: '' },
        { x: '', y: '' },
      ])
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al crear la parcela'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCoordinateChange = (
    index: number,
    field: 'x' | 'y',
    value: string
  ) => {
    const newCoordinates = [...coordinates]
    if (newCoordinates[index]) {
      newCoordinates[index][field] = value
    }
    setCoordinates(newCoordinates)
  }

  const addCoordinate = () => {
    setCoordinates([...coordinates, { x: '', y: '' }])
  }

  const removeCoordinate = (index: number) => {
    if (coordinates.length > 3) {
      const newCoordinates = coordinates.filter((_, i) => i !== index)
      setCoordinates(newCoordinates)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Crea una nueva parcela</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Crear nueva parcela
          </DialogTitle>
          <DialogDescription className="text-sm">
            Completa la información para añadir una nueva parcela a tu
            explotación.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la parcela</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Parcela Norte"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm">
                Área (hectáreas)
              </Label>
              <Input
                id="area"
                name="area"
                type="number"
                step="0.01"
                placeholder="Ej: 5.5"
                value={formData.area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm">
                Tipo
              </Label>
              <Input
                id="type"
                name="type"
                placeholder="Ej: Olivo, Trigo, Vid..."
                value={formData.type}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="irrigationType" className="text-sm">
                Tipo de riego
              </Label>
              <Input
                id="irrigationType"
                name="irrigationType"
                placeholder="Ej: Secano, Goteo..."
                value={formData.irrigationType}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label className="text-sm">Ubicación (Polígono)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCoordinate}
                className="h-8 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir punto
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {coordinates.map((coord, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`coord-x-${index}`}
                        className="text-xs text-muted-foreground"
                      >
                        X (Long.)
                      </Label>
                      <Input
                        id={`coord-x-${index}`}
                        type="number"
                        step="any"
                        placeholder="Longitud"
                        value={coord.x}
                        onChange={(e) =>
                          handleCoordinateChange(index, 'x', e.target.value)
                        }
                        required
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`coord-y-${index}`}
                        className="text-xs text-muted-foreground"
                      >
                        Y (Lat.)
                      </Label>
                      <Input
                        id={`coord-y-${index}`}
                        type="number"
                        step="any"
                        placeholder="Latitud"
                        value={coord.y}
                        onChange={(e) =>
                          handleCoordinateChange(index, 'y', e.target.value)
                        }
                        required
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  {coordinates.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoordinate(index)}
                      className="h-9 w-full sm:w-9 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Eliminar</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Define los puntos del polígono que representa tu parcela. Mínimo 3
              puntos requeridos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">
              Descripción (opcional)
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Añade detalles sobre la parcela..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Creando...' : 'Crear parcela'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
