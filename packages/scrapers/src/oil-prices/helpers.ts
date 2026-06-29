import { db, schema } from "@workspace/db"
import { PriceEntry } from "./types"

export const BROWSER_HELPERS = /* js */ `
  function toType(s) {
    const l = s.toLowerCase()
    if (l.includes('virgen extra')) return 'virgen_extra'
    if (l.includes('virgen'))       return 'virgen'
    if (l.includes('lampante'))     return 'lampante'
    return null
  }
  function txt(el) {
    return (el?.textContent ?? '').replace(/\\s+/g, ' ').trim()
  }
  function parsePrice(s) {
    const m = s.replace(',', '.').match(/[\\d]+\\.[\\d]+|[\\d]+/)
    return m ? parseFloat(m[0]) : null
  }
  function parsePct(s) {
    const m = s.match(/([+-]?[\\d]+[.,][\\d]*)%/)
    return m ? parseFloat(m[1].replace(',', '.')) : null
  }
  function parseDate(s) {
    const m = s.match(/\\d{4}-\\d{2}-\\d{2}/)
    return m ? m[0] : null
  }
`
export function getMondayOfWeek(week: number, year: number): string {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, "0")
  const d = String(monday.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export async function upsertPrices(
  entries: PriceEntry[],
  market: string
): Promise<number> {
  if (entries.length === 0) return 0

  const rows = entries.map((e) => ({
    product: "olive_oil" as const,
    grade: e.type,
    market,
    price: String(e.price),
    unit: e.unit,
    date:
      e.week > 0
        ? getMondayOfWeek(e.week, e.year)
        : new Date().toISOString().slice(0, 10),
    currency: "EUR",
    source: "oleista",
  }))

  await db
    .insert(schema.marketPrices)
    .values(rows)
    .onConflictDoNothing({
      target: [
        schema.marketPrices.product,
        schema.marketPrices.grade,
        schema.marketPrices.date,
        schema.marketPrices.market,
      ],
    })

  return rows.length
}
