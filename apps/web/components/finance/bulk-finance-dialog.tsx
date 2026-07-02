"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import type { TransactionBulkRow } from "@workspace/schemas"
import { useParcels } from "@workspace/web/hooks/parcel"
import { financeApi } from "@workspace/web/lib/api/routes/finance"
import {
  assignIncrementalInvoiceNumbers,
  EXAMPLE_PASTE,
  parsePastedFinance,
  PAYMENT_METHOD_LABELS,
} from "@workspace/web/features/onboarding/components/finance/bulk-finance-utils"

const MOCK_FINANCE_ROWS: TransactionBulkRow[] = [
  {
    id: "mock-1",
    concept: "Fertilizante NPK",
    description: "Compra NPK 25kg",
    amount: 1240.5,
    date: "2025-01-15",
    category: "fertilization",
    flow: "expense",
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2025-0001",
  },
  {
    id: "mock-2",
    concept: "Venta aceite",
    description: "Cosecha virgen extra",
    amount: 4800,
    date: "2025-02-02",
    category: "sale",
    flow: "income",
    paymentMethod: "transferencia",
    invoiceNumber: "VTA-2025-001",
  },
  {
    id: "mock-3",
    concept: "Riego por goteo",
    description: "Mantenimiento sistema goteo",
    amount: 320,
    date: "2025-02-18",
    category: "irrigation",
    flow: "expense",
    paymentMethod: "efectivo",
    invoiceNumber: "FAC-2025-0002",
  },
]

interface BulkFinanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkFinanceDialog({
  open,
  onOpenChange,
}: BulkFinanceDialogProps) {
  const queryClient = useQueryClient()
  const { data: allParcels = [], isLoading: loadingParcels } = useParcels()

  const [pasteValue, setPasteValue] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [rows, setRows] = useState<TransactionBulkRow[]>([])
  const [rowsAreExample, setRowsAreExample] = useState(false)
  const [imported, setImported] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null)

  const savedParcels = useMemo(
    () => allParcels.filter((p) => Boolean(p.id)),
    [allParcels]
  )

  useEffect(() => {
    if (savedParcels.length === 1) {
      setSelectedParcelId(savedParcels[0]?.id ?? null)
      return
    }
    setSelectedParcelId((current) => {
      if (current && savedParcels.some((p) => p.id === current)) return current
      return null
    })
  }, [savedParcels])

  const selectedParcel = savedParcels.find((p) => p.id === selectedParcelId)

  const displayRows = rows.length > 0 ? rows : MOCK_FINANCE_ROWS
  const isUsingMock = rows.length === 0
  const isExamplePreview = isUsingMock || rowsAreExample
  const hasSavedParcels = savedParcels.length > 0
  const canImport =
    rows.length > 0 &&
    !rowsAreExample &&
    hasSavedParcels &&
    selectedParcelId !== null

  const totals = useMemo(() => {
    const income = displayRows
      .filter((r) => r.flow === "income")
      .reduce((sum, r) => sum + r.amount, 0)
    const expense = displayRows
      .filter((r) => r.flow === "expense")
      .reduce((sum, r) => sum + r.amount, 0)
    return { income, expense, count: displayRows.length }
  }, [displayRows])

  const handleParse = () => {
    if (!pasteValue.trim()) {
      setParseError("Pega al menos una fila desde Excel.")
      return
    }
    const parsed = parsePastedFinance(pasteValue)
    if (parsed.length === 0) {
      setParseError(
        "No se detectaron filas válidas. Copia varias celdas con tabulaciones entre columnas."
      )
      return
    }
    setParseError(null)
    setImportError(null)
    setImported(false)
    setRowsAreExample(false)
    setRows(parsed)
  }

  const handleLoadExample = () => {
    setPasteValue(EXAMPLE_PASTE)
    setParseError(null)
    setImportError(null)
    setImported(false)
    setRowsAreExample(true)
    setRows(parsePastedFinance(EXAMPLE_PASTE))
  }

  const handleClear = () => {
    setPasteValue("")
    setParseError(null)
    setImportError(null)
    setImported(false)
    setRowsAreExample(false)
    setRows([])
  }

  const handleImport = async (): Promise<boolean> => {
    if (!canImport || imported || isImporting || !selectedParcelId)
      return imported

    setIsImporting(true)
    setImportError(null)

    try {
      const rowsWithInvoices = assignIncrementalInvoiceNumbers(rows)
      const payload = rowsWithInvoices.map(
        ({
          concept,
          description,
          amount,
          date,
          category,
          flow,
          paymentMethod,
          invoiceNumber,
        }) => ({
          concept,
          description,
          amount,
          date,
          category,
          flow,
          paymentMethod,
          invoiceNumber,
          parcelId: selectedParcelId,
        })
      )
      await financeApi.bulkCreateTransactions({ transactions: payload })
      setRows(rowsWithInvoices)
      setImported(true)
      toast.success(`${rowsWithInvoices.length} movimientos importados`)
      queryClient.invalidateQueries({ queryKey: ["finance"] })
      return true
    } catch {
      setImportError(
        "No se pudieron importar los movimientos. Inténtalo de nuevo."
      )
      toast.error("Error al importar movimientos")
      return false
    } finally {
      setIsImporting(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPasteValue("")
      setParseError(null)
      setRows([])
      setRowsAreExample(false)
      setImported(false)
      setIsImporting(false)
      setImportError(null)
      setSelectedParcelId(null)
    }
    onOpenChange(nextOpen)
  }

  const importLabel = !hasSavedParcels
    ? "Guarda una parcela antes de importar"
    : !selectedParcelId
      ? "Selecciona una parcela"
      : !canImport
        ? isExamplePreview
          ? "Los datos de ejemplo no se importan"
          : "Procesa datos antes de importar"
        : totals.count === 1
          ? "Importar 1 movimiento"
          : `Importar ${totals.count} movimientos`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Importar finanzas</DialogTitle>
          <DialogDescription>
            Copia columnas desde Excel, pégalas aquí, asigna una parcela e
            importa los movimientos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-6 lg:gap-6">
            <div className="space-y-2">
              <Label htmlFor="bulk-finance-parcel">Parcela</Label>
              {!hasSavedParcels ? (
                <p className="text-sm text-destructive">
                  Guarda al menos una parcela para poder importar movimientos.
                </p>
              ) : savedParcels.length === 1 ? (
                <p className="text-sm text-muted-foreground">
                  Los movimientos se asignarán a{" "}
                  <span className="font-medium text-foreground">
                    {savedParcels[0]?.name?.trim() || "tu parcela"}
                  </span>
                  .
                </p>
              ) : (
                <Select
                  value={selectedParcelId ?? undefined}
                  onValueChange={setSelectedParcelId}
                >
                  <SelectTrigger id="bulk-finance-parcel" className="w-full">
                    <SelectValue placeholder="Selecciona la parcela para este importe" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedParcels.map((parcel) => (
                      <SelectItem key={parcel.id} value={parcel.id}>
                        {parcel.name?.trim() || "Parcela sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-finance-paste">Datos desde Excel</Label>
              <Textarea
                id="bulk-finance-paste"
                placeholder={
                  "Pega aquí (Ctrl+V). Ejemplo de columnas:\nconcepto | descripcion | importe | fecha | categoria | tipo | metodo_pago | factura"
                }
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                className="min-h-24 font-mono text-sm sm:min-h-40"
              />
              {parseError ? (
                <p className="text-sm text-destructive">{parseError}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tip: selecciona las celdas en Excel, copia y pega. Si no
                  indicas número de factura, se generará uno incremental
                  automáticamente.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleParse}
                disabled={isImporting}
              >
                Procesar datos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadExample}
                disabled={isImporting}
              >
                Cargar ejemplo
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={isImporting}
              >
                Limpiar
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {imported
                  ? "Los movimientos se han guardado en finanzas."
                  : canImport
                    ? "Revisa los movimientos en la vista previa e impórtalos."
                    : "Los datos de ejemplo no se pueden importar. Pega y procesa tus propios movimientos."}
              </p>
              {importError ? (
                <p className="text-sm text-destructive">{importError}</p>
              ) : null}
              <Button
                type="button"
                size="lg"
                variant={imported ? "outline" : "default"}
                className={cn(
                  "h-11 w-full gap-2 shadow-sm",
                  imported &&
                    "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() => void handleImport()}
                disabled={!canImport || imported || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : imported ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Movimientos importados
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {importLabel}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="hidden min-h-0 flex-col border-l border-sidebar-border bg-sidebar-accent/40 lg:flex">
            <div className="shrink-0 border-b border-sidebar-border px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Vista previa</p>
                  <p className="text-sm text-muted-foreground">
                    {totals.count} movimientos listos para importación masiva
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedParcel ? (
                    <Badge variant="outline">
                      Parcela: {selectedParcel.name?.trim() || "Sin nombre"}
                    </Badge>
                  ) : null}
                  {isExamplePreview ? (
                    <Badge variant="secondary">Datos de ejemplo</Badge>
                  ) : (
                    <Badge>Pegado desde Excel</Badge>
                  )}
                  {imported ? <Badge>Movimientos importados</Badge> : null}
                  <Badge variant="outline">
                    Ingresos: {totals.income.toLocaleString("es-ES")} €
                  </Badge>
                  <Badge variant="outline">
                    Gastos: {totals.expense.toLocaleString("es-ES")} €
                  </Badge>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método pago</TableHead>
                    <TableHead>Nº factura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-[160px] truncate font-medium">
                        {row.concept}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-muted-foreground">
                        {row.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.amount.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="capitalize">
                        {row.category}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.flow === "income" ? "default" : "secondary"
                          }
                        >
                          {row.flow === "income" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.paymentMethod
                          ? PAYMENT_METHOD_LABELS[row.paymentMethod]
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.invoiceNumber ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
