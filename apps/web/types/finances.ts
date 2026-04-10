export type OilType = "virgen_extra" | "virgen" | "lampante"

export interface OilSummary {
  type: OilType
  label: string
  price: number
  priceMin: number
  priceMax: number
  unit: string
  date: Date
  updatedAt: string
  trend: number
}

export interface OilPricePoint {
  date: string
  virgen_extra: number
  virgen: number
  lampante: number
}

export interface MarketPrice {
  location: string
  virgen_extra: number
  virgen: number
  lampante: number
}

export type TransactionType = "income" | "expense"
export type TransactionCategory =
  | "Venta"
  | "Insumos"
  | "Maquinaria"
  | "Laboral"
  | "Seguros"
  | "Subvención"
  | "Otro"

export interface Transaction {
  id: number
  date: string
  description: string
  category: TransactionCategory
  amount: number
  type: TransactionType
}

export interface DonutSlice {
  name: string
  value: number
  fill: string
}

export type DateRange = "7D" | "2A" | "Total"
export type TxFilter = "all" | "income" | "expense"

export interface NewTransactionForm {
  description: string
  amount: string
  category: TransactionCategory
  type: TransactionType
  date: string
}
