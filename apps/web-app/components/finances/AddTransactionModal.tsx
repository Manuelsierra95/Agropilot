'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Plus } from 'lucide-react'
import { useGetParcels } from '@/hooks/useGetParcels'

interface AddTransactionModalProps {
  onAddTransaction?: (transaction: any) => void
}

function ParcelSelectorField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { parcels, isLoading } = useGetParcels()

  return (
    <div className="grid gap-2">
      <Label htmlFor="parcela">Parcela *</Label>
      <Select value={value} onValueChange={onChange} required>
        <SelectTrigger id="parcela">
          <SelectValue placeholder="Selecciona una parcela" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              Cargando parcelas...
            </div>
          ) : parcels.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No existen parcelas
            </div>
          ) : (
            parcels.map((parcel) => (
              <SelectItem key={parcel.id} value={parcel.id?.toString() || ''}>
                {parcel.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function AddTransactionModal({
  onAddTransaction,
}: AddTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: '',
    categoria: '',
    concepto: '',
    monto: '',
    metodoPago: '',
    numeroFactura: '',
    fecha: new Date().toISOString().split('T')[0],
    parcela: '',
    descripcion: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transaction = {
      ...formData,
      monto: parseFloat(formData.monto),
      id: Date.now().toString(),
    }

    onAddTransaction?.(transaction)

    // Resetear formulario
    setFormData({
      tipo: '',
      categoria: '',
      concepto: '',
      monto: '',
      metodoPago: '',
      numeroFactura: '',
      fecha: new Date().toISOString().split('T')[0],
      parcela: '',
      descripcion: '',
    })

    setOpen(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          Agregar Transacción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Transacción</DialogTitle>
          <DialogDescription>
            Registra un nuevo ingreso o gasto en tu sistema financiero.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tipo */}
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleChange('tipo', value)}
                required
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => handleChange('categoria', value)}
                required
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tipo === 'ingreso' ? (
                    <>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="subvencion">Subvención</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="insumos">Insumos</SelectItem>
                      <SelectItem value="mano-obra">Mano de Obra</SelectItem>
                      <SelectItem value="maquinaria">Maquinaria</SelectItem>
                      <SelectItem value="riego">Riego</SelectItem>
                      <SelectItem value="mantenimiento">
                        Mantenimiento
                      </SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Concepto */}
            <div className="grid gap-2">
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                placeholder="Ej: Compra de fertilizante"
                value={formData.concepto}
                onChange={(e) => handleChange('concepto', e.target.value)}
                required
              />
            </div>

            {/* Monto */}
            <div className="grid gap-2">
              <Label htmlFor="monto">Monto (€) *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.monto}
                onChange={(e) => handleChange('monto', e.target.value)}
                required
              />
            </div>

            {/* Método de Pago */}
            <div className="grid gap-2">
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <Select
                value={formData.metodoPago}
                onValueChange={(value) => handleChange('metodoPago', value)}
              >
                <SelectTrigger id="metodoPago">
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Número de Factura */}
            <div className="grid gap-2">
              <Label htmlFor="numeroFactura">Número de Factura</Label>
              <Input
                id="numeroFactura"
                placeholder="Ej: F-2024-001"
                value={formData.numeroFactura}
                onChange={(e) => handleChange('numeroFactura', e.target.value)}
              />
            </div>

            {/* Fecha */}
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                required
              />
            </div>

            {/* Parcela */}
            <ParcelSelectorField
              value={formData.parcela}
              onChange={(value) => handleChange('parcela', value)}
            />

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Detalles adicionales..."
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Transacción</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
