export type TransactionType = "ingreso" | "gasto"
export type PaymentMethod =
  | "efectivo"
  | "transferencia"
  | "tarjeta"
  | "cheque"
  | "otro"

export interface FinanceRecord {
  id: number
  parcelId: string
  parcelName: string
  crop: string
  area: number
  transactionType: TransactionType
  category: string
  concept: string
  amount: number
  date: string
  paymentMethod: PaymentMethod
  notes?: string
  invoiceNumber?: string
  quantity?: number
  unitPrice?: number
  unit?: string
}

// Categorías de ingresos
export type IncomeCategory =
  | "Venta de cereales"
  | "Venta de girasol"
  | "Subvenciones PAC"
  | "Arrendamiento de tierras"
  | "Venta de leguminosas"
  | "Servicios agronómicos"
  | "Agroseguros / indemnizaciones"
  | "Otros ingresos"
  // las que vienen del mock de transacciones
  | "Venta de cosecha"
  | "Subvenciones"

// Categorías de gastos
export type ExpenseCategory =
  | "Semillas"
  | "Fertilizantes"
  | "Fitosanitarios"
  | "Combustible"
  | "Mano de obra"
  | "Seguros"
  | "Maquinaria"
  | "Riego"

export type TransactionCategory = IncomeCategory | ExpenseCategory

export interface Transaction {
  id: number
  userId: string
  parcelId: number
  type: TransactionType
  category: TransactionCategory
  concept: string
  amount: number
  paymentMethod: PaymentMethod
  invoiceNumber: string | null
  date: Date
  description: string | null
  createdAt: Date
  updatedAt: Date
}

// Para los gráficos de tarta
export interface PieChartDataItem {
  category: TransactionCategory
  amount: number
  fill: string
}

export type ChartConfigEntry = {
  label: string
  color?: string
}

export type ChartConfig = {
  [key: string]: ChartConfigEntry
}

// ─── Helpers: categoryToKey ───────────────────────────────────────────────────
// Mapeo unificado categoría → clave CSS/chart

export const incomeCategoryToKey: Record<IncomeCategory, string> = {
  "Venta de cereales": "cereales",
  "Venta de girasol": "girasol",
  "Subvenciones PAC": "pac",
  "Arrendamiento de tierras": "arrendamiento",
  "Venta de leguminosas": "leguminosas",
  "Servicios agronómicos": "servicios",
  "Agroseguros / indemnizaciones": "agroseguros",
  "Otros ingresos": "otros",
  // Las del mock de transacciones se mapean a las claves más cercanas
  "Venta de cosecha": "cereales",
  Subvenciones: "pac",
}

export const expenseCategoryToKey: Record<ExpenseCategory, string> = {
  Semillas: "semillas",
  Fertilizantes: "fertilizantes",
  Fitosanitarios: "fitosanitarios",
  Combustible: "combustible",
  "Mano de obra": "manodeobra",
  Seguros: "seguros",
  Maquinaria: "maquinaria",
  Riego: "riego",
}

// ─── Chart configs ────────────────────────────────────────────────────────────

export const incomeChartConfig: ChartConfig = {
  amount: { label: "Monto (€)" },
  cereales: { label: "Venta de cereales", color: "var(--chart-1)" },
  girasol: { label: "Venta de girasol", color: "var(--chart-2)" },
  pac: { label: "Subvenciones PAC", color: "var(--chart-3)" },
  arrendamiento: { label: "Arrendamiento de tierras", color: "var(--chart-4)" },
  leguminosas: { label: "Venta de leguminosas", color: "var(--chart-5)" },
  servicios: {
    label: "Servicios agronómicos",
    color: "var(--chart-6, var(--chart-1))",
  },
  agroseguros: {
    label: "Agroseguros / indemnizaciones",
    color: "var(--chart-7, var(--chart-2))",
  },
  otros: { label: "Otros ingresos", color: "var(--chart-8, var(--chart-3))" },
} satisfies ChartConfig

export const expenseChartConfig: ChartConfig = {
  amount: { label: "Monto (€)" },
  semillas: { label: "Semillas", color: "var(--chart-1)" },
  fertilizantes: { label: "Fertilizantes", color: "var(--chart-2)" },
  fitosanitarios: { label: "Fitosanitarios", color: "var(--chart-3)" },
  combustible: { label: "Combustible", color: "var(--chart-4)" },
  manodeobra: { label: "Mano de obra", color: "var(--chart-5)" },
  seguros: { label: "Seguros", color: "var(--chart-6, var(--chart-1))" },
  maquinaria: { label: "Maquinaria", color: "var(--chart-7, var(--chart-2))" },
  riego: { label: "Riego", color: "var(--chart-8, var(--chart-3))" },
} satisfies ChartConfig

// ─── Chart data (estática, para los pies) ─────────────────────────────────────

export const incomeChartData: PieChartDataItem[] = [
  {
    category: "Venta de cereales",
    amount: 9020,
    fill: "var(--color-cereales)",
  },
  { category: "Venta de girasol", amount: 4750, fill: "var(--color-girasol)" },
  { category: "Subvenciones PAC", amount: 5800, fill: "var(--color-pac)" },
  {
    category: "Arrendamiento de tierras",
    amount: 4650,
    fill: "var(--color-arrendamiento)",
  },
  {
    category: "Venta de leguminosas",
    amount: 2440,
    fill: "var(--color-leguminosas)",
  },
  {
    category: "Servicios agronómicos",
    amount: 4100,
    fill: "var(--color-servicios)",
  },
  {
    category: "Agroseguros / indemnizaciones",
    amount: 4520,
    fill: "var(--color-agroseguros)",
  },
  { category: "Otros ingresos", amount: 1870, fill: "var(--color-otros)" },
]

export const expenseChartData: PieChartDataItem[] = [
  { category: "Semillas", amount: 840, fill: "var(--color-semillas)" },
  {
    category: "Fertilizantes",
    amount: 1250,
    fill: "var(--color-fertilizantes)",
  },
  {
    category: "Fitosanitarios",
    amount: 320,
    fill: "var(--color-fitosanitarios)",
  },
  { category: "Combustible", amount: 480, fill: "var(--color-combustible)" },
  { category: "Mano de obra", amount: 960, fill: "var(--color-manodeobra)" },
  { category: "Seguros", amount: 1120, fill: "var(--color-seguros)" },
  { category: "Maquinaria", amount: 390, fill: "var(--color-maquinaria)" },
  { category: "Riego", amount: 215, fill: "var(--color-riego)" },
]

// ─── Mock transactions ────────────────────────────────────────────────────────

export const mockTransactions: Transaction[] = [
  // ─── Existentes ───────────────────────────────────────────────────────────
  {
    id: 1,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Semillas",
    concept: "Semillas de trigo blando variedad Chamorro",
    amount: 840.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0312",
    date: new Date("2024-03-10"),
    description: "Compra para la siembra de otoño, 120 kg a 7 €/kg.",
    createdAt: new Date("2024-03-10T09:00:00"),
    updatedAt: new Date("2024-03-10T09:00:00"),
  },
  {
    id: 2,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Fertilizantes",
    concept: "Abono nitroamoniacal 27%",
    amount: 1250.5,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0389",
    date: new Date("2024-03-22"),
    description: null,
    createdAt: new Date("2024-03-22T11:30:00"),
    updatedAt: new Date("2024-03-22T11:30:00"),
  },
  {
    id: 3,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Fitosanitarios",
    concept: "Herbicida selectivo postemergencia",
    amount: 320.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-04-05"),
    description: "Aplicación para control de malas hierbas gramíneas.",
    createdAt: new Date("2024-04-05T08:00:00"),
    updatedAt: new Date("2024-04-05T08:00:00"),
  },
  {
    id: 4,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Combustible",
    concept: "Gasóleo B para tractor John Deere",
    amount: 480.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0421",
    date: new Date("2024-04-12"),
    description: null,
    createdAt: new Date("2024-04-12T16:00:00"),
    updatedAt: new Date("2024-04-12T16:00:00"),
  },
  {
    id: 5,
    userId: "user_01",
    parcelId: 3,
    type: "ingreso",
    category: "Venta de cosecha",
    concept: "Venta trigo blando cooperativa Arjona",
    amount: 12400.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0501",
    date: new Date("2024-07-18"),
    description: "40 toneladas a 310 €/t. Calidad molinera.",
    createdAt: new Date("2024-07-18T10:00:00"),
    updatedAt: new Date("2024-07-18T10:00:00"),
  },
  {
    id: 6,
    userId: "user_01",
    parcelId: 5,
    type: "ingreso",
    category: "Subvenciones",
    concept: "PAC — Pago básico campaña 2024",
    amount: 3870.0,
    paymentMethod: "transferencia",
    invoiceNumber: null,
    date: new Date("2024-10-03"),
    description: "Pago directo FEGA correspondiente a 18,5 ha declaradas.",
    createdAt: new Date("2024-10-03T00:00:00"),
    updatedAt: new Date("2024-10-03T00:00:00"),
  },
  {
    id: 7,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Mano de obra",
    concept: "Cuadrilla recolección girasol",
    amount: 960.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-09-14"),
    description: "4 jornaleros durante 3 días, 80 €/jornada.",
    createdAt: new Date("2024-09-14T07:30:00"),
    updatedAt: new Date("2024-09-14T07:30:00"),
  },
  {
    id: 8,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Riego",
    concept: "Cuota comunidad de regantes T2 2024",
    amount: 215.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0288",
    date: new Date("2024-06-01"),
    description: null,
    createdAt: new Date("2024-06-01T09:00:00"),
    updatedAt: new Date("2024-06-01T09:00:00"),
  },
  {
    id: 9,
    userId: "user_01",
    parcelId: 7,
    type: "ingreso",
    category: "Venta de cosecha",
    concept: "Venta algodón desmotado",
    amount: 5600.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0611",
    date: new Date("2024-11-05"),
    description: "16 t a 350 €/t. Entrega en almacén de La Carolina.",
    createdAt: new Date("2024-11-05T12:00:00"),
    updatedAt: new Date("2024-11-05T12:00:00"),
  },
  {
    id: 10,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Seguros",
    concept: "Seguro combinado de explotación agrícola 2024",
    amount: 1120.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "POL-2024-88321",
    date: new Date("2024-01-15"),
    description: "Póliza anual. Cubre pérdidas por sequía, granizo y helada.",
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
  },
  {
    id: 11,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Maquinaria",
    concept: "Reparación disco vertedera arado",
    amount: 390.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-02-28"),
    description: null,
    createdAt: new Date("2024-02-28T15:00:00"),
    updatedAt: new Date("2024-02-28T15:00:00"),
  },
  {
    id: 12,
    userId: "user_01",
    parcelId: 7,
    type: "ingreso",
    category: "Subvenciones",
    concept: "Ayuda agroambiental olivar tradicional",
    amount: 620.0,
    paymentMethod: "transferencia",
    invoiceNumber: null,
    date: new Date("2024-12-01"),
    description: "Convocatoria Junta de Andalucía, medida 10.1.",
    createdAt: new Date("2024-12-01T00:00:00"),
    updatedAt: new Date("2024-12-01T00:00:00"),
  },

  // ─── Nuevas ───────────────────────────────────────────────────────────────

  // Enero
  {
    id: 13,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Semillas",
    concept: "Semillas de girasol híbrido variedad NK Ferti",
    amount: 620.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0045",
    date: new Date("2024-01-20"),
    description: "80 kg para siembra de primavera en parcela 5.",
    createdAt: new Date("2024-01-20T10:00:00"),
    updatedAt: new Date("2024-01-20T10:00:00"),
  },
  {
    id: 14,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Maquinaria",
    concept: "Revisión anual cosechadora New Holland",
    amount: 870.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0061",
    date: new Date("2024-01-28"),
    description: "Cambio de filtros, correas y revisión del cabezal.",
    createdAt: new Date("2024-01-28T09:00:00"),
    updatedAt: new Date("2024-01-28T09:00:00"),
  },

  // Febrero
  {
    id: 15,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Fertilizantes",
    concept: "Superfosfato de cal 18%",
    amount: 780.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0102",
    date: new Date("2024-02-10"),
    description: "Abonado de fondo previo a la siembra de girasol.",
    createdAt: new Date("2024-02-10T08:30:00"),
    updatedAt: new Date("2024-02-10T08:30:00"),
  },
  {
    id: 16,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Combustible",
    concept: "Gasóleo B laboreo de invierno",
    amount: 340.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-02-18"),
    description: null,
    createdAt: new Date("2024-02-18T14:00:00"),
    updatedAt: new Date("2024-02-18T14:00:00"),
  },

  // Marzo
  {
    id: 17,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Riego",
    concept: "Cuota comunidad de regantes T1 2024",
    amount: 215.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0201",
    date: new Date("2024-03-01"),
    description: null,
    createdAt: new Date("2024-03-01T09:00:00"),
    updatedAt: new Date("2024-03-01T09:00:00"),
  },
  {
    id: 18,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Fitosanitarios",
    concept: "Fungicida sistémico tebuconazol",
    amount: 215.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0234",
    date: new Date("2024-03-15"),
    description: "Tratamiento preventivo contra roya amarilla en trigo.",
    createdAt: new Date("2024-03-15T07:00:00"),
    updatedAt: new Date("2024-03-15T07:00:00"),
  },
  {
    id: 19,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Mano de obra",
    concept: "Poda olivar parcela 7",
    amount: 1400.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-03-20"),
    description: "7 jornaleros durante 2,5 días, 80 €/jornada.",
    createdAt: new Date("2024-03-20T07:30:00"),
    updatedAt: new Date("2024-03-20T07:30:00"),
  },

  // Abril
  {
    id: 20,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Fertilizantes",
    concept: "Solución nitrogenada UAN 32%",
    amount: 560.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0401",
    date: new Date("2024-04-02"),
    description: "Aplicación en cobertera sobre cereal en encañado.",
    createdAt: new Date("2024-04-02T08:00:00"),
    updatedAt: new Date("2024-04-02T08:00:00"),
  },
  {
    id: 21,
    userId: "user_01",
    parcelId: 5,
    type: "ingreso",
    category: "Arrendamiento de tierras",
    concept: "Arrendamiento parcela auxiliar a Coop. San Isidro",
    amount: 1800.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0415",
    date: new Date("2024-04-15"),
    description: "Cesión de 6 ha por campaña. 300 €/ha.",
    createdAt: new Date("2024-04-15T11:00:00"),
    updatedAt: new Date("2024-04-15T11:00:00"),
  },

  // Mayo
  {
    id: 22,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Fitosanitarios",
    concept: "Insecticida lambda-cihalotrina polilla del olivo",
    amount: 180.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-05-08"),
    description: null,
    createdAt: new Date("2024-05-08T08:00:00"),
    updatedAt: new Date("2024-05-08T08:00:00"),
  },
  {
    id: 23,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Maquinaria",
    concept: "Alquiler sembradora de precisión",
    amount: 520.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0512",
    date: new Date("2024-05-14"),
    description: "Alquiler por 2 días para siembra de girasol.",
    createdAt: new Date("2024-05-14T09:00:00"),
    updatedAt: new Date("2024-05-14T09:00:00"),
  },
  {
    id: 24,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Combustible",
    concept: "Gasóleo B tratamientos fitosanitarios mayo",
    amount: 190.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0531",
    date: new Date("2024-05-22"),
    description: null,
    createdAt: new Date("2024-05-22T16:00:00"),
    updatedAt: new Date("2024-05-22T16:00:00"),
  },

  // Junio
  {
    id: 25,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Riego",
    concept: "Cuota comunidad de regantes T2 2024",
    amount: 215.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0601",
    date: new Date("2024-06-01"),
    description: null,
    createdAt: new Date("2024-06-01T09:00:00"),
    updatedAt: new Date("2024-06-01T09:00:00"),
  },
  {
    id: 26,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Mano de obra",
    concept: "Escarda manual malas hierbas parcela 3",
    amount: 480.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-06-10"),
    description: "2 jornaleros durante 3 días, 80 €/jornada.",
    createdAt: new Date("2024-06-10T07:30:00"),
    updatedAt: new Date("2024-06-10T07:30:00"),
  },
  {
    id: 27,
    userId: "user_01",
    parcelId: 7,
    type: "ingreso",
    category: "Servicios agronómicos",
    concept: "Asesoría técnica de cultivo a terceros",
    amount: 750.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0622",
    date: new Date("2024-06-22"),
    description: "Consultoría para agricultor vecino, campaña cereal 2024.",
    createdAt: new Date("2024-06-22T12:00:00"),
    updatedAt: new Date("2024-06-22T12:00:00"),
  },

  // Julio
  {
    id: 28,
    userId: "user_01",
    parcelId: 5,
    type: "ingreso",
    category: "Venta de cosecha",
    concept: "Venta cebada de invierno cooperativa Mengíbar",
    amount: 6800.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0710",
    date: new Date("2024-07-05"),
    description: "22 t a 309 €/t. Humedad 12,5%.",
    createdAt: new Date("2024-07-05T10:00:00"),
    updatedAt: new Date("2024-07-05T10:00:00"),
  },
  {
    id: 29,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Maquinaria",
    concept: "Servicio de cosecha a maquila trigo parcela 3",
    amount: 1100.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0718",
    date: new Date("2024-07-16"),
    description: "Tarifa 27,5 €/t sobre 40 t cosechadas.",
    createdAt: new Date("2024-07-16T08:00:00"),
    updatedAt: new Date("2024-07-16T08:00:00"),
  },
  {
    id: 30,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Combustible",
    concept: "Gasóleo B recolección julio",
    amount: 410.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0725",
    date: new Date("2024-07-20"),
    description: null,
    createdAt: new Date("2024-07-20T17:00:00"),
    updatedAt: new Date("2024-07-20T17:00:00"),
  },

  // Agosto
  {
    id: 31,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Riego",
    concept: "Cuota comunidad de regantes T3 2024",
    amount: 215.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0801",
    date: new Date("2024-08-01"),
    description: null,
    createdAt: new Date("2024-08-01T09:00:00"),
    updatedAt: new Date("2024-08-01T09:00:00"),
  },
  {
    id: 32,
    userId: "user_01",
    parcelId: 5,
    type: "ingreso",
    category: "Venta de cosecha",
    concept: "Venta girasol oleico almacén Bailén",
    amount: 7200.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0820",
    date: new Date("2024-08-20"),
    description: "18 t a 400 €/t. Acidez < 0,5%.",
    createdAt: new Date("2024-08-20T11:00:00"),
    updatedAt: new Date("2024-08-20T11:00:00"),
  },
  {
    id: 33,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Semillas",
    concept: "Semillas de colza variedad Extrovert",
    amount: 490.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-0828",
    date: new Date("2024-08-28"),
    description: "35 kg para siembra otoñal en rotación con trigo.",
    createdAt: new Date("2024-08-28T09:30:00"),
    updatedAt: new Date("2024-08-28T09:30:00"),
  },

  // Septiembre
  {
    id: 34,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Fertilizantes",
    concept: "Abono complejo NPK 15-15-15",
    amount: 930.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-0905",
    date: new Date("2024-09-05"),
    description: "Abonado de fondo para campaña otoño-invierno.",
    createdAt: new Date("2024-09-05T08:00:00"),
    updatedAt: new Date("2024-09-05T08:00:00"),
  },
  {
    id: 35,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Mano de obra",
    concept: "Cuadrilla recolección algodón parcela 7",
    amount: 1760.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-09-25"),
    description: "8 jornaleros durante 2,75 días, 80 €/jornada.",
    createdAt: new Date("2024-09-25T07:00:00"),
    updatedAt: new Date("2024-09-25T07:00:00"),
  },

  // Octubre
  {
    id: 36,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Fitosanitarios",
    concept: "Herbicida preemergencia pendimetalina",
    amount: 275.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-10-10"),
    description: "Tratamiento sobre rastrojo antes de la siembra de colza.",
    createdAt: new Date("2024-10-10T08:00:00"),
    updatedAt: new Date("2024-10-10T08:00:00"),
  },
  {
    id: 37,
    userId: "user_01",
    parcelId: 5,
    type: "ingreso",
    category: "Subvenciones",
    concept: "Eco-régimen prácticas sostenibles campaña 2024",
    amount: 2140.0,
    paymentMethod: "transferencia",
    invoiceNumber: null,
    date: new Date("2024-10-18"),
    description: "Pago FEGA por cubiertas vegetales y reducción de insumos.",
    createdAt: new Date("2024-10-18T00:00:00"),
    updatedAt: new Date("2024-10-18T00:00:00"),
  },
  {
    id: 38,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Maquinaria",
    concept: "Reparación bomba hidráulica tractor Fendt",
    amount: 640.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-1022",
    date: new Date("2024-10-22"),
    description: null,
    createdAt: new Date("2024-10-22T11:00:00"),
    updatedAt: new Date("2024-10-22T11:00:00"),
  },

  // Noviembre
  {
    id: 39,
    userId: "user_01",
    parcelId: 3,
    type: "gasto",
    category: "Semillas",
    concept: "Semillas de veza villosa para cubierta vegetal",
    amount: 210.0,
    paymentMethod: "efectivo",
    invoiceNumber: null,
    date: new Date("2024-11-08"),
    description: "30 kg. Mejora de suelo y fijación de nitrógeno.",
    createdAt: new Date("2024-11-08T09:00:00"),
    updatedAt: new Date("2024-11-08T09:00:00"),
  },
  {
    id: 40,
    userId: "user_01",
    parcelId: 7,
    type: "ingreso",
    category: "Venta de cosecha",
    concept: "Venta aceituna molino Oleícola del Sur",
    amount: 4320.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-1115",
    date: new Date("2024-11-15"),
    description: "12 t a 360 €/t. Variedad picual, rendimiento graso 22%.",
    createdAt: new Date("2024-11-15T10:00:00"),
    updatedAt: new Date("2024-11-15T10:00:00"),
  },
  {
    id: 41,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Combustible",
    concept: "Gasóleo B laboreo otoñal parcela 5",
    amount: 360.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "FAC-2024-1128",
    date: new Date("2024-11-28"),
    description: null,
    createdAt: new Date("2024-11-28T15:00:00"),
    updatedAt: new Date("2024-11-28T15:00:00"),
  },

  // Diciembre
  {
    id: 42,
    userId: "user_01",
    parcelId: 5,
    type: "gasto",
    category: "Seguros",
    concept: "Seguro de maquinaria agrícola 2025",
    amount: 680.0,
    paymentMethod: "tarjeta",
    invoiceNumber: "POL-2024-91045",
    date: new Date("2024-12-10"),
    description: "Póliza anual cosechadora y tractor. Renovación anticipada.",
    createdAt: new Date("2024-12-10T10:00:00"),
    updatedAt: new Date("2024-12-10T10:00:00"),
  },
  {
    id: 43,
    userId: "user_01",
    parcelId: 3,
    type: "ingreso",
    category: "Agroseguros / indemnizaciones",
    concept: "Indemnización seguro granizo cosecha trigo 2024",
    amount: 2800.0,
    paymentMethod: "transferencia",
    invoiceNumber: null,
    date: new Date("2024-12-15"),
    description:
      "Liquidación Agroseguro por daños estimados del 22% del rendimiento.",
    createdAt: new Date("2024-12-15T00:00:00"),
    updatedAt: new Date("2024-12-15T00:00:00"),
  },
  {
    id: 44,
    userId: "user_01",
    parcelId: 7,
    type: "gasto",
    category: "Fertilizantes",
    concept: "Enmienda cálcica caliza molida",
    amount: 430.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-1218",
    date: new Date("2024-12-18"),
    description:
      "Corrección de pH en parcela 7. Aplicación con remolque esparcidor.",
    createdAt: new Date("2024-12-18T08:00:00"),
    updatedAt: new Date("2024-12-18T08:00:00"),
  },
  {
    id: 45,
    userId: "user_01",
    parcelId: 5,
    type: "ingreso",
    category: "Arrendamiento de tierras",
    concept: "Arrendamiento parcela 5 sur a ganadero local",
    amount: 900.0,
    paymentMethod: "transferencia",
    invoiceNumber: "FAC-2024-1220",
    date: new Date("2024-12-20"),
    description: "Cesión de 3 ha para pasto de invierno. 300 €/ha.",
    createdAt: new Date("2024-12-20T11:00:00"),
    updatedAt: new Date("2024-12-20T11:00:00"),
  },
]
