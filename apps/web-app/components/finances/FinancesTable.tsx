'use client'

import { DataTable } from '@workspace/ui/components/data-table'
import { Wallet } from 'lucide-react'
import {
  FinancesTableColumns,
  type FinanceRecord,
} from './FinancesTableColumns'

interface FinancesTableProps {
  data: {
    records: FinanceRecord[]
    pagination: {
      totalPages: number
      totalItems: number
      currentPage: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  } | null
  onPageChange?: (newPage: number) => void
  onPrefetchNextPage?: (nextPage: number) => void
  currentPage?: number
  loading?: boolean
}

export default function FinancesTable({
  data,
  onPageChange,
  onPrefetchNextPage,
  currentPage = 1,
  loading = false,
}: FinancesTableProps) {
  if (!data || data.records.length === 0) {
    return (
      <div className="py-12 text-center rounded-lg bg-gray-50">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h4 className="mb-2 text-lg font-medium text-gray-900">
          No hay registros financieros
        </h4>
        <p className="text-gray-600">
          No se encontraron ingresos o gastos que coincidan con los filtros
          seleccionados.
          <br />
          Prueba con otros filtros o agrega nuevos registros.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <DataTable
        columns={FinancesTableColumns}
        data={data.records}
        onPageChange={onPageChange}
        onPrefetchNextPage={onPrefetchNextPage}
        currentPage={currentPage}
        totalPages={data.pagination.totalPages}
        totalItems={data.pagination.totalItems}
        hasNextPage={data.pagination.hasNextPage}
        hasPreviousPage={data.pagination.hasPreviousPage}
        loading={loading}
      />
    </div>
  )
}
