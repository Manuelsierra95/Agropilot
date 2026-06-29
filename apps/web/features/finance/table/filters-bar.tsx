"use client"

import type { ComponentProps } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"

import {
  FILTERS_BAR_FILTER_OPTIONS,
  FiltersBar,
  type FiltersBarFilterOption,
} from "@workspace/web/features/finance/table/components/filters-bar"
import type { Transaction } from "@workspace/web/features/finance/table/types"

type BaseFiltersBarProps = Omit<ComponentProps<typeof FiltersBar>, "columns">

export { FILTERS_BAR_FILTER_OPTIONS }
export type { FiltersBarFilterOption }

type TransactionFiltersSectionProps = BaseFiltersBarProps & {
  table: TanStackTable<Transaction>
  onNewTransaction?: () => void
}

export function TransactionFiltersSection({
  table,
  onNewTransaction,
  ...filtersProps
}: TransactionFiltersSectionProps) {
  return (
    <FiltersBar
      {...filtersProps}
      onNewTransaction={onNewTransaction}
      columns={table
        .getAllColumns()
        .filter(
          (col) => typeof col.accessorFn !== "undefined" && col.getCanHide()
        )}
    />
  )
}
