import type {
  OilSummary,
  OilPricePoint,
  MarketPrice,
  Transaction,
  DonutSlice,
} from "@workspace/web/types/finances"

export const OIL_SUMMARIES: OilSummary[] = [
  {
    type: "virgen_extra",
    label: "Virgen Extra",
    price: 7.85,
    priceMin: 7.2,
    priceMax: 8.4,
    unit: "€/kg",
    date: new Date(),
    updatedAt: "Hace 2h",
    trend: +0.12,
  },
  {
    type: "virgen",
    label: "Virgen",
    price: 6.3,
    priceMin: 5.9,
    priceMax: 6.8,
    unit: "€/kg",
    date: new Date(),
    updatedAt: "Hace 2h",
    trend: -0.05,
  },
  {
    type: "lampante",
    label: "Lampante",
    price: 4.75,
    priceMin: 4.2,
    priceMax: 5.1,
    unit: "€/kg",
    date: new Date(),
    updatedAt: "Hace 2h",
    trend: +0.08,
  },
]

export const PRICE_HISTORY_7D: OilPricePoint[] = [
  { date: "Lun", virgen_extra: 7.55, virgen: 6.1, lampante: 4.55 },
  { date: "Mar", virgen_extra: 7.7, virgen: 6.22, lampante: 4.68 },
  { date: "Mié", virgen_extra: 7.62, virgen: 6.15, lampante: 4.6 },
  { date: "Jue", virgen_extra: 7.85, virgen: 6.3, lampante: 4.75 },
  { date: "Vie", virgen_extra: 7.78, virgen: 6.25, lampante: 4.7 },
  { date: "Sáb", virgen_extra: 7.91, virgen: 6.35, lampante: 4.8 },
  { date: "Hoy", virgen_extra: 7.85, virgen: 6.3, lampante: 4.75 },
]

export const PRICE_HISTORY_2Y: OilPricePoint[] = [
  { date: "Ene'23", virgen_extra: 6.8, virgen: 5.5, lampante: 4.1 },
  { date: "Mar'23", virgen_extra: 7.0, virgen: 5.7, lampante: 4.25 },
  { date: "May'23", virgen_extra: 6.9, virgen: 5.6, lampante: 4.18 },
  { date: "Jul'23", virgen_extra: 7.2, virgen: 5.85, lampante: 4.4 },
  { date: "Sep'23", virgen_extra: 7.4, virgen: 6.0, lampante: 4.55 },
  { date: "Nov'23", virgen_extra: 7.55, virgen: 6.15, lampante: 4.65 },
  { date: "Ene'24", virgen_extra: 7.3, virgen: 5.95, lampante: 4.5 },
  { date: "Mar'24", virgen_extra: 7.6, virgen: 6.1, lampante: 4.6 },
  { date: "May'24", virgen_extra: 7.75, virgen: 6.25, lampante: 4.7 },
  { date: "Jul'24", virgen_extra: 7.5, virgen: 6.1, lampante: 4.55 },
  { date: "Sep'24", virgen_extra: 7.7, virgen: 6.2, lampante: 4.65 },
  { date: "Dic'24", virgen_extra: 7.85, virgen: 6.3, lampante: 4.75 },
]

export const PRICE_HISTORY_TOTAL: OilPricePoint[] = [
  { date: "2019", virgen_extra: 4.2, virgen: 3.4, lampante: 2.8 },
  { date: "2020", virgen_extra: 4.8, virgen: 3.9, lampante: 3.2 },
  { date: "2021", virgen_extra: 5.4, virgen: 4.3, lampante: 3.6 },
  { date: "2022", virgen_extra: 6.2, virgen: 5.0, lampante: 4.0 },
  { date: "2023", virgen_extra: 7.1, virgen: 5.8, lampante: 4.5 },
  { date: "2024", virgen_extra: 7.6, virgen: 6.15, lampante: 4.65 },
  { date: "2025", virgen_extra: 7.85, virgen: 6.3, lampante: 4.75 },
]

export const MARKET_PRICES: MarketPrice[] = [
  { location: "Mi parcela", virgen_extra: 7.6, virgen: 6.1, lampante: 4.5 },
  { location: "España", virgen_extra: 7.85, virgen: 6.3, lampante: 4.75 },
  { location: "Italia", virgen_extra: 8.2, virgen: 6.7, lampante: 5.1 },
  { location: "Portugal", virgen_extra: 7.4, virgen: 5.9, lampante: 4.3 },
  { location: "Media UE", virgen_extra: 7.76, virgen: 6.25, lampante: 4.66 },
]

export const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: "15 Mar 2025",
    description: "Venta aceite virgen extra – Coop. Jaén",
    category: "Venta",
    amount: +12480,
    type: "income",
  },
  {
    id: 2,
    date: "10 Mar 2025",
    description: "Reparación cosechadora",
    category: "Maquinaria",
    amount: -1850,
    type: "expense",
  },
  {
    id: 3,
    date: "05 Mar 2025",
    description: "Fitosanitarios – tratamiento marzo",
    category: "Insumos",
    amount: -640,
    type: "expense",
  },
  {
    id: 4,
    date: "28 Feb 2025",
    description: "Subvención PAC Q1",
    category: "Subvención",
    amount: +3200,
    type: "income",
  },
  {
    id: 5,
    date: "20 Feb 2025",
    description: "Venta aceite virgen – mercado local",
    category: "Venta",
    amount: +4320,
    type: "income",
  },
  {
    id: 6,
    date: "15 Feb 2025",
    description: "Fertilizantes abono de fondo",
    category: "Insumos",
    amount: -980,
    type: "expense",
  },
  {
    id: 7,
    date: "10 Feb 2025",
    description: "Poda olivos – mano de obra",
    category: "Laboral",
    amount: -2100,
    type: "expense",
  },
  {
    id: 8,
    date: "01 Feb 2025",
    description: "Seguro agrario anual",
    category: "Seguros",
    amount: -720,
    type: "expense",
  },
]

export const DONUT_DATA: DonutSlice[] = [
  { name: "Ventas aceite", value: 16800, fill: "#0a0a0a" },
  { name: "Subvenciones", value: 3200, fill: "#404040" },
  { name: "Otros ingresos", value: 900, fill: "#6b6b6b" },
  { name: "Insumos", value: 1620, fill: "#9e9e9e" },
  { name: "Maquinaria", value: 1850, fill: "#bdbdbd" },
  { name: "Laboral", value: 2100, fill: "#d6d6d6" },
  { name: "Seguros", value: 720, fill: "#ededed" },
]

export const TRANSACTION_CATEGORIES = [
  "Venta",
  "Insumos",
  "Maquinaria",
  "Laboral",
  "Seguros",
  "Subvención",
  "Otro",
] as const
