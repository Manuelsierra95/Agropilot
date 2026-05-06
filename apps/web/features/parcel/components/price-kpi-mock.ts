import type { KpiItem } from "./price-kpi-card"

/**
 * Mock de precios de mercado para cultivos agrícolas.
 * Precios en €/kg para aceite de oliva y derivados del olivar.
 */
export const olivarPriceKpis: KpiItem[] = [
  {
    name: "Aceite de Oliva Virgen Extra",
    price: 5.42,
    priceMin: 4.8,
    priceMax: 6.1,
    unit: "kg",
    currency: "€",
    updatedAt: "09/04/2026",
  },
  {
    name: "Aceite de Oliva Virgen",
    price: 4.85,
    priceMin: 4.1,
    priceMax: 5.5,
    unit: "kg",
    currency: "€",
    updatedAt: "09/04/2026",
  },
  {
    name: "Aceituna de Mesa",
    price: 0.78,
    priceMin: 0.55,
    priceMax: 0.95,
    unit: "kg",
    currency: "€",
    updatedAt: "09/04/2026",
  },
  {
    name: "Orujo de Oliva",
    price: 2.14,
    priceMin: 1.8,
    priceMax: 2.6,
    unit: "kg",
    currency: "€",
    updatedAt: "09/04/2026",
  },
]

/**
 * Precios de mercado genéricos para la vista "todas las parcelas".
 */
export const genericPriceKpis: KpiItem[] = [
  {
    name: "Trigo Blando",
    price: 218.5,
    priceMin: 195.0,
    priceMax: 240.0,
    unit: "t",
    currency: "€",
    updatedAt: "09/04/2026",
  },
  {
    name: "Cebada",
    price: 195.0,
    priceMin: 175.0,
    priceMax: 215.0,
    unit: "t",
    currency: "€",
    updatedAt: "09/04/2026",
  },
  {
    name: "Aceite de Oliva V.E.",
    price: 5.42,
    priceMin: 4.8,
    priceMax: 6.1,
    unit: "kg",
    currency: "€",
    updatedAt: "09/04/2026",
  },
  {
    name: "Almendra (cáscara)",
    price: 1.32,
    priceMin: 1.05,
    priceMax: 1.65,
    unit: "kg",
    currency: "€",
    updatedAt: "09/04/2026",
  },
]
