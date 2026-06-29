import type { OilGrade } from "@workspace/schemas"
import { DASHBOARD_OIL_GRADES } from "@workspace/schemas"
import { queryMarketPrices } from "../queries/transaction-queries"
import type { MarketPriceRow } from "../domain/types"

const CACHE_TTL_MS = 15 * 60 * 1000

type PricesByGrade = Record<OilGrade, MarketPriceRow[]>

type CacheEntry = {
  expiresAt: number
  data: PricesByGrade
}

let cache: { key: string; entry: CacheEntry } | null = null

async function fetchMarketPricesByGrade(
  from: string,
  to: string
): Promise<PricesByGrade> {
  const entries = await Promise.all(
    DASHBOARD_OIL_GRADES.map(async (grade) => {
      const rows = await queryMarketPrices({ grade, from, to })
      return [grade, rows] as const
    })
  )

  return Object.fromEntries(entries) as PricesByGrade
}

export async function getCachedMarketPricesByGrade(
  from: string,
  to: string
): Promise<PricesByGrade> {
  const key = `${from}:${to}`
  const now = Date.now()

  if (cache?.key === key && cache.entry.expiresAt > now) {
    return cache.entry.data
  }

  const data = await fetchMarketPricesByGrade(from, to)
  cache = {
    key,
    entry: {
      expiresAt: now + CACHE_TTL_MS,
      data,
    },
  }

  return data
}

/** @internal Test helper */
export function clearMarketPricesCache(): void {
  cache = null
}
