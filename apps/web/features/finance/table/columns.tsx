import {
  IconDownload,
  IconDotsVertical,
  IconFileInvoice,
  IconTrash,
} from "@tabler/icons-react"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import type { Transaction } from "./types"
import { PAYMENT_METHOD_LABELS } from "./constants"
import { formatCurrency, formatDate } from "./helpers"
import { TypeBadge } from "./components/type-badge"
import { TableCellViewer } from "./components/table-cell-viewer"

export const columns: ColumnDef<Transaction>[] = [
  // ── Selection ────────────────────────────────────────────────────────────
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // ── Concepto (moved first) ────────────────────────────────────────────────
  {
    accessorKey: "concept",
    header: "Concepto",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },

  // ── Fecha ─────────────────────────────────────────────────────────────────
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.date)}
      </span>
    ),
  },

  // ── Tipo ──────────────────────────────────────────────────────────────────
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => <TypeBadge type={row.original.type} />,
  },

  // ── Categoría ─────────────────────────────────────────────────────────────
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.category}
      </Badge>
    ),
  },

  // ── Importe ───────────────────────────────────────────────────────────────
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Importe</div>,
    cell: ({ row }) => (
      <div
        className={`text-right font-medium tabular-nums ${
          row.original.type === "ingreso"
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-red-700 dark:text-red-400"
        }`}
      >
        {row.original.type === "gasto" ? "−" : "+"}
        {formatCurrency(row.original.amount)}
      </div>
    ),
  },

  // ── Método de pago ────────────────────────────────────────────────────────
  {
    accessorKey: "paymentMethod",
    header: "Pago",
    cell: ({ row }) =>
      row.original.paymentMethod ? (
        <Badge variant="secondary" className="px-1.5">
          {PAYMENT_METHOD_LABELS[row.original.paymentMethod]}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },

  // ── Factura ───────────────────────────────────────────────────────────────
  {
    accessorKey: "invoiceNumber",
    header: "Factura",
    cell: ({ row }) =>
      row.original.invoiceNumber ? (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <IconFileInvoice className="size-3.5 shrink-0" />
          {row.original.invoiceNumber}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },

  // ── Acciones ──────────────────────────────────────────────────────────────
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem>Duplicar</DropdownMenuItem>
          {row.original.invoiceNumber && (
            <DropdownMenuItem
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 1000)),
                  {
                    loading: "Preparando factura…",
                    success: "Factura descargada",
                    error: "Error al descargar",
                  }
                )
              }
            >
              <IconDownload className="mr-2 size-4" />
              Descargar factura
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <IconTrash className="mr-2 size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
