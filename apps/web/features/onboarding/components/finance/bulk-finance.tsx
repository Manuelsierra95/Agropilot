"use client"

import { useMemo, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  MOCK_FINANCE_ROWS,
  type FinanceBulkRow,
} from "../../mocks/onboarding-mocks"
import { OnboardingSplitLayout } from "../onboarding-split-layout"

const COLUMN_ALIASES: Record<string, keyof Omit<FinanceBulkRow, "id">> = {
  concepto: "concept",
  concept: "concept",
  descripcion: "concept",
  importe: "amount",
  amount: "amount",
  cantidad: "amount",
  monto: "amount",
  fecha: "date",
  date: "date",
  categoria: "category",
  category: "category",
  tipo: "flow",
  flow: "flow",
  movimiento: "flow",
}

const FLOW_ALIASES: Record<string, FinanceBulkRow["flow"]> = {
  ingreso: "income",
  income: "income",
  gasto: "expense",
  expense: "expense",
  egreso: "expense",
}

function normalizeHeader(
  cell: string
): keyof Omit<FinanceBulkRow, "id"> | null {
  const key = cell.trim().toLowerCase()
  return COLUMN_ALIASES[key] ?? null
}

function parseAmount(raw: string): number | null {
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".")
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : null
}

function parseFlow(raw: string): FinanceBulkRow["flow"] {
  const key = raw.trim().toLowerCase()
  return FLOW_ALIASES[key] ?? (key.includes("ing") ? "income" : "expense")
}

function parsePastedFinance(text: string): FinanceBulkRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split("\t").map((cell) => cell.trim()))
    .filter((cells) => cells.some((cell) => cell.length > 0))

  if (lines.length === 0) return []

  const firstRow = lines[0] ?? []
  const headerKeys = firstRow.map(normalizeHeader)
  const hasHeader = headerKeys.filter(Boolean).length >= 2
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map((cells, index) => {
    const row: Omit<FinanceBulkRow, "id"> = {
      concept: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      category: "other",
      flow: "expense",
    }

    if (hasHeader) {
      firstRow.forEach((_, colIndex) => {
        const field = headerKeys[colIndex]
        const value = cells[colIndex] ?? ""
        if (!field || !value) return
        if (field === "amount") {
          const amount = parseAmount(value)
          if (amount !== null) row.amount = amount
        } else if (field === "flow") {
          row.flow = parseFlow(value)
        } else {
          row[field] = value as never
        }
      })
    } else if (cells.length === 1) {
      row.concept = cells[0] ?? ""
      row.amount = 0
    } else {
      row.concept = cells[0] ?? ""
      const amount = parseAmount(cells[1] ?? "")
      if (amount !== null) row.amount = amount
      if (cells[2]) row.date = cells[2]
      if (cells[3]) row.category = cells[3]
      if (cells[4]) row.flow = parseFlow(cells[4])
    }

    return {
      id: `paste-${index}-${Date.now()}`,
      ...row,
    }
  })
}

const EXAMPLE_PASTE = `concepto\timporte\tfecha\tcategoria\ttipo
Fertilizante NPK\t1240,50\t2025-01-15\tfertilization\tgasto
Venta aceite\t4800\t2025-02-02\tsale\tingreso`

interface BulkFinanceProps {
  rows: FinanceBulkRow[]
  onRowsChange: (rows: FinanceBulkRow[]) => void
  onContinue?: () => void
  onSkip?: () => void
}

export function BulkFinance({
  rows,
  onRowsChange,
  onContinue,
  onSkip,
}: BulkFinanceProps) {
  const [pasteValue, setPasteValue] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)

  const displayRows = rows.length > 0 ? rows : MOCK_FINANCE_ROWS
  const isUsingMock = rows.length === 0

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
    onRowsChange(parsed)
  }

  const handleLoadExample = () => {
    setPasteValue(EXAMPLE_PASTE)
    setParseError(null)
    onRowsChange(parsePastedFinance(EXAMPLE_PASTE))
  }

  const handleClear = () => {
    setPasteValue("")
    setParseError(null)
    onRowsChange([])
  }

  return (
    <OnboardingSplitLayout
      footer={
        <div className="flex flex-col gap-1">
          <Button type="button" size="lg" onClick={onContinue}>
            Continuar
          </Button>
          <Button type="button" size="lg" variant="ghost" onClick={onSkip}>
            Omitir este paso
          </Button>
        </div>
      }
      previewHeader={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Vista previa</p>
            <p className="text-sm text-muted-foreground">
              {totals.count} movimientos listos para importación masiva
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isUsingMock ? (
              <Badge variant="secondary">Datos de ejemplo</Badge>
            ) : (
              <Badge>Pegado desde Excel</Badge>
            )}
            <Badge variant="outline">
              Ingresos: {totals.income.toLocaleString("es-ES")} €
            </Badge>
            <Badge variant="outline">
              Gastos: {totals.expense.toLocaleString("es-ES")} €
            </Badge>
          </div>
        </div>
      }
      preview={
        <div className="h-full min-h-0 overflow-y-auto p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {row.concept}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.amount.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell className="capitalize">{row.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.flow === "income" ? "default" : "secondary"}
                    >
                      {row.flow === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
    >
      <div className="flex flex-col gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Importar finanzas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Copia una o varias columnas desde Excel y pégalas aquí. Detectamos
            tabulaciones entre columnas y saltos de línea entre filas.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="finance-paste">Datos desde Excel</Label>
          <Textarea
            id="finance-paste"
            placeholder={
              "Pega aquí (Ctrl+V). Ejemplo de columnas:\nconcepto | importe | fecha | categoria | tipo"
            }
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            className="min-h-24 font-mono text-sm sm:min-h-40"
          />
          {parseError ? (
            <p className="text-sm text-destructive">{parseError}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tip: selecciona las celdas en Excel, copia y pega. Una sola
              columna también funciona (se usará como concepto).
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleParse}>
            Procesar datos
          </Button>
          <Button type="button" variant="outline" onClick={handleLoadExample}>
            Cargar ejemplo
          </Button>
          <Button type="button" variant="ghost" onClick={handleClear}>
            Limpiar
          </Button>
        </div>
      </div>
    </OnboardingSplitLayout>
  )
}

export type { FinanceBulkRow }
