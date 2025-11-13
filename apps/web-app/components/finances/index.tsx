'use client'

import { useState, useMemo } from 'react'
import FinancesTable from './FinancesTable'
import AddTransactionModal from './AddTransactionModal'
import { useGetTransactions } from '@/hooks/useGetTransactions'
import { useTransactionStore } from '@/store/useTransactionStore'
import { useParcelStore } from '@/store/useParcelStore'
import {
  getUserTransactions,
  getParcelTransactions,
} from '@/lib/transactionsData'

export function Finances() {
  const [currentPage, setCurrentPage] = useState(1)
  const { transactions, pagination, isLoading, error, refetch } =
    useGetTransactions({
      page: currentPage,
      limit: 10,
    })

  const { parcels, parcelId } = useParcelStore()
  const { getTransactions, isStale, setTransactions } = useTransactionStore()

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePrefetchNextPage = async (nextPage: number) => {
    if (!parcelId) return

    // Verificar si la página siguiente ya está cacheada y no está obsoleta
    const cachedTransactions = getTransactions(parcelId, nextPage)
    const needsPrefetch =
      cachedTransactions.length === 0 || isStale(parcelId, nextPage)

    if (!needsPrefetch) return

    // Prefetch siguiente página
    try {
      let data

      if (parcelId === 'all') {
        data = await getUserTransactions({
          page: nextPage,
          limit: 10,
        })
      } else {
        data = await getParcelTransactions(Number(parcelId), {
          page: nextPage,
          limit: 10,
        })
      }

      // Guardar en el store
      setTransactions(data, parcelId, nextPage)
    } catch (err) {
      console.error('Error al hacer prefetch:', err)
    }
  }

  const handleAddTransaction = async (transaction: any) => {
    try {
      const { createTransaction } = await import('@/lib/transactionsData')

      await createTransaction(transaction)

      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        await refetch()
      }
    } catch (err) {
      console.error('Error al crear transacción:', err)
    }
  }

  const enrichedTransactions = useMemo(() => {
    return transactions.map((transaction) => {
      const parcel = parcels.find((p) => p.id === transaction.parcelId)

      return {
        id: transaction.id.toString(),
        parcelId: transaction.parcelId.toString(),
        parcelName: parcel?.name || 'Parcela desconocida',
        crop: parcel?.type || 'N/A',
        area: parcel?.area || 0,
        transactionType: transaction.type,
        category: transaction.category,
        concept: transaction.concept,
        amount: transaction.amount,
        date: new Date(transaction.date),
        paymentMethod: transaction.paymentMethod || 'otro',
        notes: transaction.description || undefined,
        invoiceNumber: transaction.invoiceNumber || undefined,
      }
    })
  }, [transactions, parcels])
  const financesData = pagination
    ? {
        records: enrichedTransactions,
        pagination: {
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          currentPage: pagination.currentPage,
          itemsPerPage: pagination.itemsPerPage,
          hasNextPage: pagination.hasNextPage,
          hasPreviousPage: pagination.hasPreviousPage,
        },
      }
    : null

  return (
    <div className="w-full h-full p-3 sm:p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Registro de Transacciones</h3>
          <AddTransactionModal onAddTransaction={handleAddTransaction} />
        </div>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <FinancesTable
          data={financesData}
          onPageChange={handlePageChange}
          onPrefetchNextPage={handlePrefetchNextPage}
          currentPage={currentPage}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
