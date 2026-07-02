"use client"

import * as React from "react"
import {
  IconAdjustmentsHorizontal,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconCurrencyEuro,
  IconFileSpreadsheet,
  IconLayoutColumns,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import type { Column } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Separator } from "@workspace/ui/components/separator"

import { BulkFinanceDialog } from "@workspace/web/components/finance/bulk-finance-dialog"
import {
  CATEGORIES,
  PAYMENT_METHOD_LABELS,
} from "@workspace/web/features/finance/components/table/constants"
import type { TransactionFilters } from "@workspace/web/features/finance/components/table/hooks/use-transaction-filters"

// ─── Types ────────────────────────────────────────────────────────────────────

export const FILTERS_BAR_FILTER_OPTIONS = [
  "columns",
  "amount",
  "dates",
  "categories",
  "paymentMethods",
  "searchBar",
] as const

export type FiltersBarFilterOption = (typeof FILTERS_BAR_FILTER_OPTIONS)[number]

interface FiltersBarProps {
  filters: TransactionFilters
  setField: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  totalResults: number
  enabledFilters?: readonly FiltersBarFilterOption[]
  onNewTransaction?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Column<any, unknown>[]
}

// ─── FilterPill ───────────────────────────────────────────────────────────────

function FilterPill({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border bg-muted/50 px-2 text-xs text-muted-foreground">
      <span className="max-w-56 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}`}
        className="ml-0.5 rounded-sm hover:text-foreground"
      >
        <IconX className="size-3" />
      </button>
    </span>
  )
}

// ─── MultiSelectDropdown (used inside FiltersDropdown) ────────────────────────

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
  renderLabel,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
  renderLabel?: (value: string) => string
}) {
  const isActive = selected.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
        >
          {label}
          {isActive ? (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 rounded-full px-1.5 text-[10px] font-semibold"
            >
              {selected.length}
            </Badge>
          ) : (
            <IconChevronDown className="size-3.5 opacity-60" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={(e) => {
              e.preventDefault()
              onToggle(opt)
            }}
            className="flex items-center justify-between gap-2"
          >
            <span>{renderLabel ? renderLabel(opt) : opt}</span>
            {selected.includes(opt) && (
              <IconCheck className="size-3.5 shrink-0 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                onClear()
              }}
              className="justify-center text-xs text-muted-foreground"
            >
              Limpiar selección
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── FiltersDropdown ──────────────────────────────────────────────────────────

function FiltersDropdown({
  filters,
  setField,
  isEnabled,
}: {
  filters: TransactionFilters
  setField: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void
  isEnabled: (filter: FiltersBarFilterOption) => boolean
}) {
  const activeCount = [
    isEnabled("amount") && (filters.amountMin || filters.amountMax),
    isEnabled("dates") && (filters.dateFrom || filters.dateTo),
    ...(isEnabled("categories") ? filters.categories : []),
    ...(isEnabled("paymentMethods") ? filters.paymentMethods : []),
  ].filter(Boolean).length

  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    setField("categories", next)
  }

  function togglePaymentMethod(pm: string) {
    const next = filters.paymentMethods.includes(pm)
      ? filters.paymentMethods.filter((p) => p !== pm)
      : [...filters.paymentMethods, pm]
    setField("paymentMethods", next)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={activeCount > 0 ? "default" : "outline"}
          size="sm"
          className="h-8 shrink-0 gap-1.5"
        >
          <IconAdjustmentsHorizontal className="size-3.5" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 ? (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 rounded-full px-1.5 text-[10px] font-semibold"
            >
              {activeCount}
            </Badge>
          ) : (
            <IconChevronDown className="size-3.5 opacity-60" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col gap-3 p-3">
        {/* Amount */}
        {isEnabled("amount") && (
          <div className="flex flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <IconCurrencyEuro className="size-3.5" />
              Rango de importe
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Mínimo (€)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={filters.amountMin}
                  onChange={(e) => setField("amountMin", e.target.value)}
                  className="h-8 w-28 text-sm"
                />
              </div>
              <span className="mt-5 shrink-0 text-xs text-muted-foreground">
                –
              </span>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Máximo (€)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Sin límite"
                  value={filters.amountMax}
                  onChange={(e) => setField("amountMax", e.target.value)}
                  className="h-8 w-28 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        {isEnabled("dates") && (
          <div className="flex flex-col gap-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <IconCalendar className="size-3.5" />
              Rango de fechas
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Desde</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setField("dateFrom", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <span className="mt-5 shrink-0 text-xs text-muted-foreground">
                →
              </span>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Hasta</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setField("dateTo", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Categories & Payment methods as the original multi-select dropdowns */}
        {(isEnabled("categories") || isEnabled("paymentMethods")) && (
          <div className="flex flex-wrap items-center gap-2">
            {isEnabled("categories") && (
              <MultiSelectDropdown
                label="Categoría"
                options={CATEGORIES}
                selected={filters.categories}
                onToggle={toggleCategory}
                onClear={() => setField("categories", [])}
              />
            )}
            {isEnabled("paymentMethods") && (
              <MultiSelectDropdown
                label="Método de pago"
                options={Object.keys(PAYMENT_METHOD_LABELS)}
                selected={filters.paymentMethods}
                onToggle={togglePaymentMethod}
                onClear={() => setField("paymentMethods", [])}
                renderLabel={(v) => PAYMENT_METHOD_LABELS[v] ?? v}
              />
            )}
          </div>
        )}

        {activeCount > 0 && (
          <>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs text-muted-foreground"
              onClick={() => {
                setField("amountMin", "")
                setField("amountMax", "")
                setField("dateFrom", "")
                setField("dateTo", "")
                setField("categories", [])
                setField("paymentMethods", [])
              }}
            >
              Limpiar filtros
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── FiltersBar ───────────────────────────────────────────────────────────────

export function FiltersBar({
  filters,
  setField,
  resetFilters,
  hasActiveFilters,
  totalResults,
  enabledFilters = FILTERS_BAR_FILTER_OPTIONS,
  onNewTransaction,
  columns,
}: FiltersBarProps) {
  const enabledFiltersSet = new Set(enabledFilters)
  const isEnabled = (filter: FiltersBarFilterOption) =>
    enabledFiltersSet.has(filter)

  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  const hasVisibleAdvancedFilters =
    isEnabled("amount") ||
    isEnabled("dates") ||
    isEnabled("categories") ||
    isEnabled("paymentMethods")

  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    setField("categories", next)
  }

  function togglePaymentMethod(pm: string) {
    const next = filters.paymentMethods.includes(pm)
      ? filters.paymentMethods.filter((p) => p !== pm)
      : [...filters.paymentMethods, pm]
    setField("paymentMethods", next)
  }

  return (
    <div className="grid gap-2 pb-4">
      {/* ── Single row ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Column visibility */}
        {isEnabled("columns") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5"
              >
                <IconLayoutColumns className="size-3.5" />
                <span className="hidden sm:inline">Columnas</span>
                <IconChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Columnas visibles
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Filters dropdown */}
        {hasVisibleAdvancedFilters && (
          <FiltersDropdown
            filters={filters}
            setField={setField}
            isEnabled={isEnabled}
          />
        )}

        {/* Search bar — fixed width like before */}
        {isEnabled("searchBar") && (
          <div className="relative w-full lg:w-72">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar concepto, factura, importe, fecha…"
              value={filters.globalSearch}
              onChange={(e) => setField("globalSearch", e.target.value)}
              className="h-8 pl-8 text-sm"
            />
            {filters.globalSearch && (
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setField("globalSearch", "")}
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {isEnabled("searchBar") && (
          <span className="hidden shrink-0 text-xs text-muted-foreground lg:inline">
            {totalResults} resultado{totalResults !== 1 ? "s" : ""}
          </span>
        )}

        {/* Active filter pills + clear — inline after search */}
        {hasActiveFilters && (
          <>
            <div className="flex items-center">
              <Separator orientation="vertical" className="m-auto flex h-5" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 shrink-0 gap-1 text-muted-foreground"
                onClick={resetFilters}
              >
                <IconX className="size-3.5" />
                Limpiar filtros
              </Button>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
              {isEnabled("searchBar") && filters.globalSearch && (
                <FilterPill
                  label={`"${filters.globalSearch}"`}
                  onRemove={() => setField("globalSearch", "")}
                />
              )}
              {isEnabled("amount") &&
                (filters.amountMin || filters.amountMax) && (
                  <FilterPill
                    label={`Importe: ${filters.amountMin || "0"} – ${filters.amountMax || "∞"} €`}
                    onRemove={() => {
                      setField("amountMin", "")
                      setField("amountMax", "")
                    }}
                  />
                )}
              {isEnabled("dates") && (filters.dateFrom || filters.dateTo) && (
                <FilterPill
                  label={`Fecha: ${filters.dateFrom || "inicio"} → ${filters.dateTo || "hoy"}`}
                  onRemove={() => {
                    setField("dateFrom", "")
                    setField("dateTo", "")
                  }}
                />
              )}
              {isEnabled("categories") &&
                filters.categories.map((cat) => (
                  <FilterPill
                    key={cat}
                    label={cat}
                    onRemove={() => toggleCategory(cat)}
                  />
                ))}
              {isEnabled("paymentMethods") &&
                filters.paymentMethods.map((pm) => (
                  <FilterPill
                    key={pm}
                    label={PAYMENT_METHOD_LABELS[pm] ?? pm}
                    onRemove={() => togglePaymentMethod(pm)}
                  />
                ))}
            </div>
          </>
        )}

        {/* Import finance */}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 shrink-0 gap-1.5"
          onClick={() => setImportDialogOpen(true)}
        >
          <IconFileSpreadsheet className="size-3.5" />
          <span className="hidden sm:inline">Importar finanzas</span>
        </Button>

        {/* New transaction */}
        <Button
          size="sm"
          className="h-8 shrink-0 gap-1.5 bg-accent-foreground/80 text-background hover:bg-accent-foreground"
          onClick={onNewTransaction}
        >
          <IconPlus className="size-3.5" />
          <span className="hidden sm:inline">Nueva transacción</span>
        </Button>
      </div>
      <BulkFinanceDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  )
}
