"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import {
  flexRender,
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

import { Button } from "@workspace/ui/components/button"

import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import type { Transaction } from "./types"
import { formatDate } from "./helpers"
import { columns } from "./columns"
import { useTransactionFilters } from "./hooks/use-transaction-filters"
import { BulkActionsBar } from "./components/bulk-actions-bar"
import { EmptyState } from "./components/empty-state"
import { FiltersBar } from "./components/filters-bar"

export function TransactionTable({
  data: initialData,
}: {
  data: Transaction[]
}) {
  if (initialData.length === 0) return <EmptyState />

  const [data, setData] = React.useState(() => initialData)

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
    columns,
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
      {/* Filters bar (owns the full toolbar: columns, filters, search, new button) */}
      <FiltersBar
        filters={filters}
        setField={setField}
        resetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        totalResults={filteredData.length}
        columns={table
          .getAllColumns()
          .filter(
            (col) => typeof col.accessorFn !== "undefined" && col.getCanHide()
          )}
      />

      {/* Table — min-h keeps the layout stable when row count changes */}
      <div
        className="overflow-hidden rounded-lg border"
        style={{ minHeight: "420px" }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron transacciones con los filtros actuales.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {selectedCount > 0
            ? `${selectedCount} de ${table.getFilteredRowModel().rows.length} fila(s) seleccionada(s)`
            : `${table.getFilteredRowModel().rows.length} transacción(es)`}
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Filas por página
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Primera página</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Página anterior</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Página siguiente</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Última página</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
      />
    </div>
  )
}
