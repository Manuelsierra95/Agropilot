"use client"

import * as React from "react"
import {
  IconAdjustmentsHorizontal,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconCurrencyEuro,
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

import { CATEGORIES, PAYMENT_METHOD_LABELS } from "../constants"
import type { TransactionFilters } from "../hooks/use-transaction-filters"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FiltersBarProps {
  filters: TransactionFilters
  setField: <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  totalResults: number
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
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:text-foreground">
        <IconX className="size-3" />
      </button>
    </span>
  )
}

// ─── MultiSelectDropdown ──────────────────────────────────────────────────────

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

// ─── AmountRangePopover ───────────────────────────────────────────────────────

function AmountRangePopover({
  amountMin,
  amountMax,
  setAmountMin,
  setAmountMax,
}: {
  amountMin: string
  amountMax: string
  setAmountMin: (v: string) => void
  setAmountMax: (v: string) => void
}) {
  const isActive = amountMin !== "" || amountMax !== ""

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
        >
          <IconCurrencyEuro className="size-3.5" />
          Importe
          {isActive ? (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 rounded-full px-1.5 text-[10px] font-semibold"
            >
              ✓
            </Badge>
          ) : (
            <IconChevronDown className="size-3.5 opacity-60" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Rango de importe
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Mínimo (€)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="0,00"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Máximo (€)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="Sin límite"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        {isActive && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs text-muted-foreground"
              onClick={() => {
                setAmountMin("")
                setAmountMax("")
              }}
            >
              Limpiar
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ─── DateRangePopover ─────────────────────────────────────────────────────────

function DateRangePopover({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
}: {
  dateFrom: string
  dateTo: string
  setDateFrom: (v: string) => void
  setDateTo: (v: string) => void
}) {
  const isActive = dateFrom !== "" || dateTo !== ""

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="h-8 gap-1.5"
        >
          <IconCalendar className="size-3.5" />
          Fechas
          {isActive ? (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 rounded-full px-1.5 text-[10px] font-semibold"
            >
              ✓
            </Badge>
          ) : (
            <IconChevronDown className="size-3.5 opacity-60" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Rango de fechas
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        {isActive && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs text-muted-foreground"
              onClick={() => {
                setDateFrom("")
                setDateTo("")
              }}
            >
              Limpiar
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
  columns,
}: FiltersBarProps) {
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
    <div className="tablet:grid-rows-2 grid grid-rows-3 gap-2 pb-4 lg:grid-rows-1">
      <div className="flex items-center justify-start gap-2">
        {/* Column visibility dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
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

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <IconAdjustmentsHorizontal className="size-4 shrink-0 text-muted-foreground" />

          <AmountRangePopover
            amountMin={filters.amountMin}
            amountMax={filters.amountMax}
            setAmountMin={(v) => setField("amountMin", v)}
            setAmountMax={(v) => setField("amountMax", v)}
          />

          <DateRangePopover
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            setDateFrom={(v) => setField("dateFrom", v)}
            setDateTo={(v) => setField("dateTo", v)}
          />

          <MultiSelectDropdown
            label="Categoría"
            options={CATEGORIES}
            selected={filters.categories}
            onToggle={toggleCategory}
            onClear={() => setField("categories", [])}
          />

          <MultiSelectDropdown
            label="Método de pago"
            options={Object.keys(PAYMENT_METHOD_LABELS)}
            selected={filters.paymentMethods}
            onToggle={togglePaymentMethod}
            onClear={() => setField("paymentMethods", [])}
            renderLabel={(v) => PAYMENT_METHOD_LABELS[v] ?? v}
          />

          {hasActiveFilters && (
            <>
              <Separator orientation="vertical" className="h-5" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-muted-foreground"
                onClick={resetFilters}
              >
                <IconX className="size-3.5" />
                Limpiar filtros
              </Button>
            </>
          )}
        </div>

        {/* Search + result count */}
        <div className="flex items-center gap-2">
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
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setField("globalSearch", "")}
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
          <span className="hidden shrink-0 text-xs text-muted-foreground lg:inline">
            {totalResults} resultado{totalResults !== 1 ? "s" : ""}
          </span>
        </div>

        {/* New transaction button */}
        <Button size="sm" className="h-8 justify-end gap-1.5">
          <IconPlus className="size-3.5" />
          <span className="hidden sm:inline">Nueva transacción</span>
        </Button>
      </div>

      {/* ── Active filter pills ──────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {filters.globalSearch && (
            <FilterPill
              label={`"${filters.globalSearch}"`}
              onRemove={() => setField("globalSearch", "")}
            />
          )}
          {(filters.amountMin || filters.amountMax) && (
            <FilterPill
              label={`Importe: ${filters.amountMin || "0"} – ${filters.amountMax || "∞"} €`}
              onRemove={() => {
                setField("amountMin", "")
                setField("amountMax", "")
              }}
            />
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <FilterPill
              label={`Fecha: ${filters.dateFrom || "inicio"} → ${filters.dateTo || "hoy"}`}
              onRemove={() => {
                setField("dateFrom", "")
                setField("dateTo", "")
              }}
            />
          )}
          {filters.categories.map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              onRemove={() => toggleCategory(cat)}
            />
          ))}
          {filters.paymentMethods.map((pm) => (
            <FilterPill
              key={pm}
              label={PAYMENT_METHOD_LABELS[pm] ?? pm}
              onRemove={() => togglePaymentMethod(pm)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
