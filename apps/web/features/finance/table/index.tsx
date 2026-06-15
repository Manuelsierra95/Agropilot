"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"

import { getColumns } from "./columns"
import { EmptyState } from "./components/empty-state"
import {
  TransactionFiltersSection,
  type FiltersBarFilterOption,
} from "./filters-bar"
import { formatDate } from "./helpers"
import { useTransactionFilters } from "./hooks/use-transaction-filters"
import { TransactionResultsTable } from "./transaction-table"
import type { Transaction } from "./types"

export function TransactionTable({
  data: initialData,
  filtersSection = true,
  enabledFilters,
  showParcelColumn = false,
}: {
  data: Transaction[]
  filtersSection?: boolean
  enabledFilters?: readonly FiltersBarFilterOption[]
  showParcelColumn?: boolean
}) {
  const [data, setData] = React.useState(() => initialData)

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const tableColumns = React.useMemo(
    () => getColumns(showParcelColumn),
    [showParcelColumn]
  )

  const { filters, setField, resetFilters, hasActiveFilters, filteredData } =
    useTransactionFilters(data)

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setRowSelection({})
  }, [filters])

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  function handleBulkDelete() {
    const selectedIds = new Set(
      table.getFilteredSelectedRowModel().rows.map((r) => r.original.id)
    )
    setData((prev) => prev.filter((t) => !selectedIds.has(t.id)))
    table.resetRowSelection()
    toast.success(
      `${selectedIds.size} ${selectedIds.size === 1 ? "transacción eliminada" : "transacciones eliminadas"}`
    )
  }

  function handleBulkExport() {
    const rows = table.getFilteredSelectedRowModel().rows
    const csv = [
      [
        "Fecha",
        "Tipo",
        "Categoría",
        "Concepto",
        "Importe",
        "Método de pago",
        "Nº Factura",
      ].join(";"),
      ...rows.map((r) =>
        [
          formatDate(r.original.date),
          r.original.type,
          r.original.category,
          r.original.concept,
          r.original.amount,
          r.original.paymentMethod ?? "",
          r.original.invoiceNumber ?? "",
        ].join(";")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transacciones_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Exportación completada")
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <Card className="gap-0 bg-background ring-0">
          {filtersSection ? (
            <CardHeader>
              <TransactionFiltersSection
                table={table}
                filters={filters}
                setField={setField}
                resetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                totalResults={filteredData.length}
                enabledFilters={enabledFilters}
              />
            </CardHeader>
          ) : null}
          <CardContent className={filtersSection ? "pt-0" : undefined}>
            <TransactionResultsTable
              table={table}
              selectedCount={selectedCount}
              onDeleteAction={handleBulkDelete}
              onExportAction={handleBulkExport}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
