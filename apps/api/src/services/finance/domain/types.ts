export type CampaignPeriod = {
  name: string
  startDate: string
  endDate: string
}

export type TransactionQueryFilters = {
  from: string
  to: string
  flow?: "income" | "expense"
  category?: string
}

export type OilGrade = "virgen_extra" | "virgen" | "lampante"

export type MarketPricesQueryFilters = {
  grade: OilGrade
  from: string
  to: string
}

export type MarketPriceRow = {
  date: string
  price: string
}
