import {
  paymentMethodSchema,
  transactionCategorySchema,
  type PaymentMethod,
  type TransactionBulkRow,
  type TransactionCategory,
} from "@workspace/schemas"

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
  cheque: "Cheque",
  otro: "Otro",
}

const COLUMN_ALIASES: Record<string, keyof Omit<TransactionBulkRow, "id">> = {
  concepto: "concept",
  concept: "concept",
  descripcion: "description",
  description: "description",
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
  metodo_pago: "paymentMethod",
  payment_method: "paymentMethod",
  pago: "paymentMethod",
  factura: "invoiceNumber",
  invoice: "invoiceNumber",
  numero_factura: "invoiceNumber",
  invoice_number: "invoiceNumber",
}

const FLOW_ALIASES: Record<string, TransactionBulkRow["flow"]> = {
  ingreso: "income",
  income: "income",
  gasto: "expense",
  expense: "expense",
  egreso: "expense",
}

const PAYMENT_METHOD_ALIASES: Record<string, PaymentMethod> = {
  transferencia: "transferencia",
  transfer: "transferencia",
  tarjeta: "tarjeta",
  card: "tarjeta",
  efectivo: "efectivo",
  cash: "efectivo",
  cheque: "cheque",
  check: "cheque",
  otro: "otro",
  other: "otro",
}

const CATEGORY_ALIASES: Record<string, TransactionCategory> = {
  riego: "irrigation",
  irrigation: "irrigation",
  fertilizacion: "fertilization",
  fertilizante: "fertilization",
  fertilization: "fertilization",
  tratamiento: "treatment",
  treatment: "treatment",
  labor: "labor",
  "mano de obra": "labor",
  maquinaria: "machinery",
  machinery: "machinery",
  combustible: "fuel",
  fuel: "fuel",
  cosecha: "harvest",
  harvest: "harvest",
  venta: "sale",
  sale: "sale",
  subvencion: "subsidy",
  subsidy: "subsidy",
  other: "other",
  otro: "other",
  otros: "other",
}

const INVOICE_SEQUENCE_PATTERN = /^[A-Z]+-(\d{4})-(\d+)$/i

export function parseInvoiceSequence(
  invoiceNumber: string
): { year: number; seq: number } | null {
  const match = invoiceNumber.trim().match(INVOICE_SEQUENCE_PATTERN)
  if (!match) return null
  return { year: Number(match[1]), seq: Number(match[2]) }
}

export function formatInvoiceNumber(year: number, seq: number): string {
  return `FAC-${year}-${String(seq).padStart(4, "0")}`
}

function normalizeHeader(
  cell: string
): keyof Omit<TransactionBulkRow, "id"> | null {
  const key = cell.trim().toLowerCase()
  return COLUMN_ALIASES[key] ?? null
}

function parseAmount(raw: string): number | null {
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".")
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : null
}

function parseFlow(raw: string): TransactionBulkRow["flow"] {
  const key = raw.trim().toLowerCase()
  return FLOW_ALIASES[key] ?? (key.includes("ing") ? "income" : "expense")
}

function parseCategory(raw: string): TransactionCategory {
  const key = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

  if (CATEGORY_ALIASES[key]) {
    return CATEGORY_ALIASES[key]
  }

  const parsed = transactionCategorySchema.safeParse(key)
  return parsed.success ? parsed.data : "other"
}

function parsePaymentMethod(raw: string): PaymentMethod | null {
  const key = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

  if (PAYMENT_METHOD_ALIASES[key]) {
    return PAYMENT_METHOD_ALIASES[key]
  }

  const parsed = paymentMethodSchema.safeParse(key)
  return parsed.success ? parsed.data : null
}

function createEmptyRow(): Omit<TransactionBulkRow, "id"> {
  return {
    concept: "",
    description: null,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    category: "other",
    flow: "expense",
    paymentMethod: null,
    invoiceNumber: null,
  }
}

export function assignIncrementalInvoiceNumbers(
  rows: TransactionBulkRow[]
): TransactionBulkRow[] {
  const maxByYear = new Map<string, number>()

  for (const row of rows) {
    if (!row.invoiceNumber?.trim()) continue
    const parsed = parseInvoiceSequence(row.invoiceNumber)
    if (!parsed) continue
    const yearKey = String(parsed.year)
    maxByYear.set(yearKey, Math.max(maxByYear.get(yearKey) ?? 0, parsed.seq))
  }

  return rows.map((row) => {
    if (row.invoiceNumber?.trim()) return row

    const year = row.date.slice(0, 4)
    const next = (maxByYear.get(year) ?? 0) + 1
    maxByYear.set(year, next)

    return {
      ...row,
      invoiceNumber: formatInvoiceNumber(Number(year), next),
    }
  })
}

export function parsePastedFinance(text: string): TransactionBulkRow[] {
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

  const parsed = dataLines.map((cells, index) => {
    const row = createEmptyRow()

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
        } else if (field === "category") {
          row.category = parseCategory(value)
        } else if (field === "paymentMethod") {
          row.paymentMethod = parsePaymentMethod(value)
        } else if (field === "description") {
          row.description = value
        } else if (field === "invoiceNumber") {
          row.invoiceNumber = value
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
      if (cells[3]) row.category = parseCategory(cells[3])
      if (cells[4]) row.flow = parseFlow(cells[4])
    }

    return {
      id: `paste-${index}-${Date.now()}`,
      ...row,
    }
  })

  return assignIncrementalInvoiceNumbers(parsed)
}

export const EXAMPLE_PASTE = `concepto\tdescripcion\timporte\tfecha\tcategoria\ttipo\tmetodo_pago\tfactura
Fertilizante NPK\tCompra NPK 25kg\t1240,50\t2025-01-15\tfertilization\tgasto\ttransferencia\t
Venta aceite\tCosecha virgen extra\t4800\t2025-02-02\tsale\tingreso\ttransferencia\tVTA-2025-001`
