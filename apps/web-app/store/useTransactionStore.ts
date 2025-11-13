import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CACHE_TIME } from '@/utils/constants'

export type TransactionType = 'ingreso' | 'gasto'
export type PaymentMethod = 'transferencia' | 'tarjeta' | 'efectivo' | 'otro'

export interface Transaction {
  id: number
  userId: string
  parcelId: number
  type: TransactionType
  category: string
  concept: string
  amount: number
  paymentMethod: PaymentMethod | null
  invoiceNumber: string | null
  date: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface ParcelTransactionsCache {
  transactions: Transaction[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  lastFetched: number
}

interface TransactionState {
  transactionsByParcel: Record<string, ParcelTransactionsCache>
  setTransactions: (
    transactionsResponse: TransactionsResponse,
    parcelId: string,
    page: number
  ) => void
  getTransactions: (parcelId: string, page: number) => Transaction[]
  getPagination: (
    parcelId: string,
    page: number
  ) => TransactionsResponse['pagination'] | null
  addTransaction: (transaction: Transaction, parcelId: string) => void
  removeTransaction: (id: number, parcelId: string) => void
  updateTransaction: (
    id: number,
    transaction: Partial<Transaction>,
    parcelId: string
  ) => void
  clearTransactions: (parcelId?: string) => void
  isStale: (parcelId: string, page: number, maxAge?: number) => boolean
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactionsByParcel: {},

      setTransactions: (
        transactionsResponse: TransactionsResponse,
        parcelId: string,
        page: number
      ) => {
        const cacheKey = `${parcelId}_page_${page}`
        set((state) => ({
          transactionsByParcel: {
            ...state.transactionsByParcel,
            [cacheKey]: {
              transactions: transactionsResponse.transactions,
              pagination: transactionsResponse.pagination,
              lastFetched: Date.now(),
            },
          },
        }))
      },

      getTransactions: (parcelId: string, page: number) => {
        const cacheKey = `${parcelId}_page_${page}`
        const cache = get().transactionsByParcel[cacheKey]
        return cache?.transactions || []
      },

      getPagination: (parcelId: string, page: number) => {
        const cacheKey = `${parcelId}_page_${page}`
        const cache = get().transactionsByParcel[cacheKey]
        return cache?.pagination || null
      },

      addTransaction: (transaction: Transaction, parcelId: string) =>
        set((state) => {
          const cache = state.transactionsByParcel[parcelId]
          const currentTransactions = cache?.transactions || []

          return {
            transactionsByParcel: {
              ...state.transactionsByParcel,
              [parcelId]: {
                transactions: [transaction, ...currentTransactions],
                pagination: cache?.pagination || {
                  currentPage: 1,
                  totalPages: 1,
                  totalItems: currentTransactions.length + 1,
                  itemsPerPage: 10,
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
                lastFetched: cache?.lastFetched || Date.now(),
              },
            },
          }
        }),

      removeTransaction: (id: number, parcelId: string) =>
        set((state) => {
          const cache = state.transactionsByParcel[parcelId]
          if (!cache) return state

          return {
            transactionsByParcel: {
              ...state.transactionsByParcel,
              [parcelId]: {
                transactions: cache.transactions.filter((t) => t.id !== id),
                pagination: cache.pagination,
                lastFetched: cache.lastFetched,
              },
            },
          }
        }),

      updateTransaction: (
        id: number,
        updatedTransaction: Partial<Transaction>,
        parcelId: string
      ) =>
        set((state) => {
          const cache = state.transactionsByParcel[parcelId]
          if (!cache) return state

          return {
            transactionsByParcel: {
              ...state.transactionsByParcel,
              [parcelId]: {
                transactions: cache.transactions.map((t) =>
                  t.id === id ? { ...t, ...updatedTransaction } : t
                ),
                pagination: cache.pagination,
                lastFetched: cache.lastFetched,
              },
            },
          }
        }),

      clearTransactions: (parcelId?: string) =>
        set((state) => {
          if (parcelId) {
            const { [parcelId]: _, ...rest } = state.transactionsByParcel
            return { transactionsByParcel: rest }
          }
          return { transactionsByParcel: {} }
        }),

      isStale: (parcelId: string, page: number, maxAge = CACHE_TIME) => {
        const cacheKey = `${parcelId}_page_${page}`
        const cache = get().transactionsByParcel[cacheKey]
        if (!cache) return true
        return Date.now() - cache.lastFetched > maxAge
      },
    }),
    {
      name: 'transactions-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
