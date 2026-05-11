"use client"

import type { ComponentProps } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"

import {
  FILTERS_BAR_FILTER_OPTIONS,
  FiltersBar,
  type FiltersBarFilterOption,
} from "./components/filters-bar"
import type { Transaction } from "./types"

type BaseFiltersBarProps = Omit<ComponentProps<typeof FiltersBar>, "columns">

export { FILTERS_BAR_FILTER_OPTIONS }
export type { FiltersBarFilterOption }

type TransactionFiltersSectionProps = BaseFiltersBarProps & {
  table: TanStackTable<Transaction>
}

export function TransactionFiltersSection({
  table,
  ...filtersProps
}: TransactionFiltersSectionProps) {
  return (
    <FiltersBar
      {...filtersProps}
      columns={table
        .getAllColumns()
        .filter(
          (col) => typeof col.accessorFn !== "undefined" && col.getCanHide()
        )}
    />
  )
}
