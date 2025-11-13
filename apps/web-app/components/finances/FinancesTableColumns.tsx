'use client'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react'
import type {
  TransactionType,
  PaymentMethod,
} from '@/store/useTransactionStore'

export interface FinanceRecord {
  id: string
  parcelId: string
  parcelName: string
  crop: string
  area: number
  transactionType: TransactionType
  category: string
  concept: string
  amount: number
  date: Date
  paymentMethod: PaymentMethod
  notes?: string
  invoiceNumber?: string
  quantity?: number
  unitPrice?: number
  unit?: string
}

const categoryColorMap: Record<string, string> = {
  'Venta de cosecha': 'bg-green-100 text-green-800 hover:bg-green-100',
  Subvenciones: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  Fertilizantes: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  Fitosanitarios: 'bg-red-100 text-red-800 hover:bg-red-100',
  'Mano de obra': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  'Agua y riego': 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  Combustible: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  Mantenimiento: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
}

const paymentMethodMap: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}

export const FinancesTableColumns: any[] = [
  {
    accessorKey: 'date',
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => {
      const date = row.getValue('date') as Date
      return (
        <div className="pl-3 font-medium">
          {date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'transactionType',
    header: 'Tipo',
    cell: ({ row }: { row: any }) => {
      const type = row.getValue('transactionType') as string
      const isIngreso = type === 'ingreso'

      return (
        <div className="flex items-center gap-2">
          {isIngreso ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Ingreso
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Gasto</span>
            </>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'parcelName',
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Parcela
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => (
      <div className="pl-3">
        <div className="font-medium">{row.getValue('parcelName')}</div>
        <div className="text-xs text-gray-500">
          {row.original.crop} · {row.original.area} ha
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Categoría',
    cell: ({ row }: { row: any }) => {
      const category = row.getValue('category') as string
      const colorClass =
        categoryColorMap[category] || 'bg-gray-100 text-gray-800'

      return (
        <Badge variant="secondary" className={colorClass}>
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'concept',
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Concepto
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => (
      <div className="pl-3">
        <div className="font-medium">{row.getValue('concept')}</div>
        {row.original.quantity && row.original.unitPrice && (
          <div className="text-xs text-gray-500">
            {row.original.quantity.toLocaleString('es-ES')} {row.original.unit}{' '}
            ×{' '}
            {row.original.unitPrice.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            €
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }: { column: any }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Importe
          <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row }: { row: any }) => {
      const amount = row.getValue('amount') as number
      const isIngreso = row.original.transactionType === 'ingreso'

      return (
        <div
          className={`pl-3 text-right font-bold ${isIngreso ? 'text-green-600' : 'text-red-600'}`}
        >
          {isIngreso ? '+' : '-'}
          {amount.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          €
        </div>
      )
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Pago',
    cell: ({ row }: { row: any }) => {
      const method = row.getValue('paymentMethod') as string
      return (
        <div className="text-sm text-gray-600">
          {paymentMethodMap[method] || method}
        </div>
      )
    },
  },
  {
    accessorKey: 'invoiceNumber',
    header: 'Nº Factura',
    cell: ({ row }: { row: any }) => {
      const invoiceNumber = row.original.invoiceNumber
      return invoiceNumber ? (
        <div className="text-xs font-mono text-gray-600">{invoiceNumber}</div>
      ) : (
        <div className="text-xs text-gray-400">—</div>
      )
    },
  },
]
