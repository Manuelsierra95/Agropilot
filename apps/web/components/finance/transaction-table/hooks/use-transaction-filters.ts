"use client"

import * as React from "react"
import type { Transaction } from "@workspace/web/components/finance/transaction-table/types"

export interface TransactionFilters {
  globalSearch: string
  amountMin: string
  amountMax: string
  dateFrom: string
  dateTo: string
  categories: string[]
  paymentMethods: string[]
}

const EMPTY_FILTERS: TransactionFilters = {
  globalSearch: "",
  amountMin: "",
  amountMax: "",
  dateFrom: "",
  dateTo: "",
  categories: [],
  paymentMethods: [],
}

export function useTransactionFilters(data: Transaction[]) {
  const [filters, setFilters] =
    React.useState<TransactionFilters>(EMPTY_FILTERS)

  const setField = React.useCallback(
    <K extends keyof TransactionFilters>(
      key: K,
      value: TransactionFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const resetFilters = React.useCallback(() => setFilters(EMPTY_FILTERS), [])

  const hasActiveFilters = React.useMemo(
    () =>
      filters.globalSearch !== "" ||
      filters.amountMin !== "" ||
      filters.amountMax !== "" ||
      filters.dateFrom !== "" ||
      filters.dateTo !== "" ||
      filters.categories.length > 0 ||
      filters.paymentMethods.length > 0,
    [filters]
  )

  const filteredData = React.useMemo(() => {
    const q = filters.globalSearch.toLowerCase().trim()
    const amountMin =
      filters.amountMin !== "" ? parseFloat(filters.amountMin) : null
    const amountMax =
      filters.amountMax !== "" ? parseFloat(filters.amountMax) : null
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null
    const dateTo = filters.dateTo
      ? new Date(filters.dateTo + "T23:59:59")
      : null

    return data.filter((t) => {
      // ── Global search: concept, invoiceNumber, amount, date ──────────────
      if (q) {
        const dateStr = new Intl.DateTimeFormat("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
          .format(new Date(t.date))
          .toLowerCase()

        const amountStr = t.amount.toString()
        const amountFormatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        })
          .format(t.amount)
          .toLowerCase()

        const matches =
          t.concept.toLowerCase().includes(q) ||
          (t.invoiceNumber?.toLowerCase().includes(q) ?? false) ||
          amountStr.includes(q) ||
          amountFormatted.includes(q) ||
          dateStr.includes(q)

        if (!matches) return false
      }

      // ── Amount range ──────────────────────────────────────────────────────
      if (amountMin !== null && !isNaN(amountMin) && t.amount < amountMin)
        return false
      if (amountMax !== null && !isNaN(amountMax) && t.amount > amountMax)
        return false

      // ── Date range ────────────────────────────────────────────────────────
      const txDate = new Date(t.date)
      if (dateFrom && txDate < dateFrom) return false
      if (dateTo && txDate > dateTo) return false

      // ── Categories ────────────────────────────────────────────────────────
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(t.category)
      )
        return false

      // ── Payment methods ───────────────────────────────────────────────────
      if (
        filters.paymentMethods.length > 0 &&
        (t.paymentMethod === null ||
          !filters.paymentMethods.includes(t.paymentMethod))
      )
        return false

      return true
    })
  }, [data, filters])

  return { filters, setField, resetFilters, hasActiveFilters, filteredData }
}
