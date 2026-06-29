import { chromium } from "playwright"
import { BROWSER_HELPERS, upsertPrices } from "./helpers"
import { PriceEntry, CountryEntry } from "./types"

async function scrapePricesPage(page: import("playwright").Page) {
  await page.goto("https://oleista.com/es/precios", {
    waitUntil: "networkidle",
    timeout: 30_000,
  })

  return page.evaluate((helpers) => {
    eval(helpers)
    // @ts-expect-error — declaradas via eval(helpers)
    declare function toType(s: string): string | null
    // @ts-expect-error — declaradas via eval(helpers)
    declare function txt(el: Element | null): string
    // @ts-expect-error — declaradas via eval(helpers)
    declare function parsePrice(s: string): number | null
    // @ts-expect-error — declaradas via eval(helpers)
    declare function parsePct(s: string): number | null
    // @ts-expect-error — declaradas via eval(helpers)
    declare function parseDate(s: string): string | null

    const sections: { heading: string; rows: any[] }[] = []

    const all = Array.from(document.body.querySelectorAll("*"))
    for (let i = 0; i < all.length; i++) {
      const el = all[i]!
      const tag = el.tagName.toLowerCase()
      if (!["h2", "h3", "h4"].includes(tag)) continue

      const heading = txt(el)
      if (!heading || heading.length > 80) continue

      let tableEl: Element | null = null
      for (let j = i + 1; j < Math.min(i + 15, all.length); j++) {
        const candidate = all[j]!
        if (candidate.tagName === "TABLE") {
          tableEl = candidate
          break
        }
        const inner = candidate.querySelector?.("table")
        if (inner) {
          tableEl = inner as Element
          break
        }
      }
      if (!tableEl) continue

      const rows: any[] = []
      tableEl.querySelectorAll("tr").forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll("td")).map((td) => txt(td))
        if (cells.length < 2) return

        const t = toType(cells[0]!)
        if (!t) return

        const priceRaw = cells.find((c) => c.includes("€")) ?? ""
        const price = parsePrice(priceRaw)
        if (!price) return

        let week = 0,
          year = new Date().getFullYear(),
          updatedAt: string | null = null
        const change = parsePct(cells[0]!)

        for (const c of cells) {
          const n = parseInt(c)
          if (!isNaN(n) && n >= 1 && n <= 53 && c.trim() === String(n)) week = n
          if (!isNaN(n) && n >= 2020 && n <= 2035 && c.trim() === String(n))
            year = n
          const d = parseDate(c)
          if (d) updatedAt = d
        }

        rows.push({
          type: t,
          price,
          priceMin: null,
          priceMax: null,
          change10d: change,
          unit: "€/kg",
          week,
          year,
          updatedAt,
        })
      })

      if (rows.length > 0) sections.push({ heading, rows })
    }

    return { sections }
  }, BROWSER_HELPERS)
}

export async function getOilPrices() {
  const start = performance.now()

  const COUNTRY_KEYS = [
    "Italy",
    "Greece",
    "Portugal",
    "Turkiye",
    "Tunisia",
    "Lebanon",
  ]

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    locale: "es-ES",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
  })
  const page = await ctx.newPage()

  try {
    const { sections } = await scrapePricesPage(page)

    const national: PriceEntry[] = []
    const countries: CountryEntry[] = []

    for (const { heading, rows } of sections) {
      const h = heading.toLowerCase()
      if (h.includes("spain") || h.includes("españa")) {
        national.push(...(rows as PriceEntry[]))
      } else {
        const key = COUNTRY_KEYS.find((k) => h.includes(k.toLowerCase()))
        if (key) {
          const ex = countries.find((c) => c.country === key)
          if (ex) ex.prices.push(...(rows as PriceEntry[]))
          else countries.push({ country: key, prices: rows as PriceEntry[] })
        }
      }
    }

    let totalInserted = 0

    totalInserted += await upsertPrices(national, "España")

    for (const { country, prices } of countries) {
      totalInserted += await upsertPrices(prices, country)
    }

    const duration = Math.round(performance.now() - start)

    return { totalInserted, countryCount: countries.length, duration }
  } finally {
    await browser.close()
  }
}
