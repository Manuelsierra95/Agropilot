export type OilType = "virgen_extra" | "virgen" | "lampante"

export type PriceEntry = {
  type: OilType
  price: number
  priceMin: number | null
  priceMax: number | null
  change10d: number | null
  unit: string
  week: number
  year: number
  updatedAt: string | null
}

export type CountryEntry = {
  country: string
  prices: PriceEntry[]
}
