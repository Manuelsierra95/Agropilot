import { chromium } from 'playwright'
import { db, schema } from '@workspace/db'

// ---------- types ----------

type OilType = 'virgen_extra' | 'virgen' | 'lampante'

type PriceEntry = {
  type: OilType
  price: number
  priceMin: number | null
  priceMax: number | null
  change10d: number | null // % cambio últimos 10 días
  unit: string
  week: number
  year: number
  updatedAt: string | null
}

type RegionEntry = {
  region: string
  prices: PriceEntry[]
}

type CountryEntry = {
  country: string
  prices: PriceEntry[]
}

type ScrapedPrices = {
  scrapedAt: string
  spain: {
    summary: PriceEntry[] // Cards "España": media/min/max
    national: PriceEntry[] // Tabla "Spain": tipo/precio/semana
    andalucia: PriceEntry[] // Tabla "Andalucia"
    regions: RegionEntry[] // /es/precios/espana
  }
  countries: CountryEntry[] // Italy, Greece, Portugal, etc.
}

// ---------- browser-context helpers (se serializan con page.evaluate) ----------

const BROWSER_HELPERS = /* js */ `
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

// ---------- helpers ----------

function getMondayOfWeek(week: number, year: number): string {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function upsertPrices(
  entries: PriceEntry[],
  market: string,
): Promise<number> {
  if (entries.length === 0) return 0

  const rows = entries.map((e) => ({
    product: 'olive_oil' as const,
    grade: e.type,
    market,
    price: String(e.price),
    unit: e.unit,
    date: e.week > 0
      ? getMondayOfWeek(e.week, e.year)
      : new Date().toISOString().slice(0, 10),
    currency: 'EUR',
    source: 'oleista',
  }))

  await db
    .insert(schema.marketPrices)
    .values(rows)
    .onConflictDoNothing({
      target: [
        schema.marketPrices.product,
        schema.marketPrices.grade,
        schema.marketPrices.date,
      ],
    })

  return rows.length
}

// ---------- scraper: /es/precios ----------

async function scrapePricesPage(page: import('playwright').Page) {
  await page.goto('https://oleista.com/es/precios', {
    waitUntil: 'networkidle',
    timeout: 30_000,
  })

  return page.evaluate((helpers) => {
    eval(helpers)
    declare function toType(s: string): string | null
    declare function txt(el: Element | null): string
    declare function parsePrice(s: string): number | null
    declare function parsePct(s: string): number | null
    declare function parseDate(s: string): string | null

    // ── 1. Summary cards ────────────────────────────────────────────────
    // Busca el bloque "España" con precio medio, min y max
    const summary: any[] = []

    // Las cards suelen ser <article>, <div class="...card..."> o similar
    const cardSelectors = [
      'article',
      '[class*="card"]',
      '[class*="Card"]',
      '[class*="price-card"]',
    ]
    let cards: NodeListOf<Element> | null = null
    for (const sel of cardSelectors) {
      const found = document.querySelectorAll(sel)
      if (found.length >= 3) {
        cards = found
        break
      }
    }

    if (cards) {
      cards.forEach((card) => {
        const raw = txt(card)
        const t = toType(raw)
        if (!t) return

        // precio medio: número con 4 decimales tipo "4.1950"
        const priceM = raw.match(/([\d]+[.,][\d]{3,4})\s*€\/kg/i)
        const price = priceM ? parseFloat(priceM[1].replace(',', '.')) : null
        if (!price) return

        const minMax = raw.match(/Min:\s*([\d.,]+)\s*€.*Max:\s*([\d.,]+)\s*€/i)
        const change = parsePct(raw)

        // Evitar duplicados: solo añadir si este type aún no está en summary
        if (!summary.some((e: any) => e.type === t)) {
          summary.push({
            type: t,
            price,
            priceMin: minMax ? parseFloat(minMax[1].replace(',', '.')) : null,
            priceMax: minMax ? parseFloat(minMax[2].replace(',', '.')) : null,
            change10d: change,
            unit: '€/kg',
            week: 0,
            year: new Date().getFullYear(),
            updatedAt: null,
          })
        }
      })
    }

    // ── 2. Tables con encabezados (Spain, Andalucia, Italy, ...) ────────
    const sections: { heading: string; rows: any[] }[] = []

    // Recorremos todos los elementos y buscamos pares encabezado→tabla
    const all = Array.from(document.body.querySelectorAll('*'))
    for (let i = 0; i < all.length; i++) {
      const el = all[i]
      const tag = el.tagName.toLowerCase()
      if (!['h2', 'h3', 'h4'].includes(tag)) continue

      const heading = txt(el)
      if (!heading || heading.length > 80) continue

      // Busca la tabla más cercana hacia adelante (hasta 10 elementos)
      let tableEl: Element | null = null
      for (let j = i + 1; j < Math.min(i + 15, all.length); j++) {
        if (all[j].tagName === 'TABLE') {
          tableEl = all[j]
          break
        }
        const inner = all[j].querySelector?.('table')
        if (inner) {
          tableEl = inner
          break
        }
      }
      if (!tableEl) continue

      const rows: any[] = []
      tableEl.querySelectorAll('tr').forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll('td')).map((td) => txt(td))
        if (cells.length < 2) return

        const t = toType(cells[0])
        if (!t) return

        // El precio puede estar en cells[0] (con €) o cells[1]
        const priceRaw = cells.find((c) => c.includes('€')) ?? ''
        const price = parsePrice(priceRaw)
        if (!price) return

        let week = 0,
          year = new Date().getFullYear(),
          updatedAt: string | null = null
        const change = parsePct(cells[0])

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
          unit: '€/kg',
          week,
          year,
          updatedAt,
        })
      })

      if (rows.length > 0) sections.push({ heading, rows })
    }

    return { summary, sections }
  }, BROWSER_HELPERS)
}

// ---------- scraper: /es/precios/espana ----------

async function scrapeRegionsPage(
  page: import('playwright').Page,
): Promise<RegionEntry[]> {
  await page.goto('https://oleista.com/es/precios/espana', {
    waitUntil: 'networkidle',
    timeout: 30_000,
  })

  return page.evaluate((helpers) => {
    eval(helpers)
    declare function toType(s: string): string | null
    declare function txt(el: Element | null): string
    declare function parsePrice(s: string): number | null
    declare function parseDate(s: string): string | null

    // Estructura real de la tabla en /es/precios/espana:
    //
    // <tr>  ← header de mini-tabla (se ignora)
    //   <th>Región</th><th>Tipo</th><th>Precio</th><th>Semana</th><th>Año</th>
    // </tr>
    // <tr>  ← fila de datos
    //   <td>Almería</td>
    //   <td>Virgen Extra\nActualización: 2026-02-15</td>
    //   <td>4.55 €/kg</td>
    //   <td>7</td>
    //   <td>2026</td>
    // </tr>
    //
    // El nombre de región puede aparecer solo en la primera fila de su bloque;
    // las siguientes filas del mismo bloque tienen la celda de región vacía
    // → guardamos el último nombre de región visto (lastRegion).

    const SKIP_ROW = /^(región|tipo|precio|semana|año)$/i

    const map = new Map<string, any[]>()
    let lastRegion = ''

    document.querySelectorAll('table').forEach((table) => {
      table.querySelectorAll('tr').forEach((tr) => {
        const tds = Array.from(tr.querySelectorAll('td'))
        if (tds.length < 4) return // saltar filas de encabezado (<th>) o vacías

        const cells = tds.map((td) => txt(td))

        // Ignorar filas de cabecera que hayan sido renderizadas como <td>
        if (SKIP_ROW.test(cells[0])) return

        // cells[0] = región (puede estar vacía si es continuación del mismo bloque)
        // cells[1] = tipo + "Actualización: YYYY-MM-DD"
        // cells[2] = precio "4.55 €/kg"
        // cells[3] = semana
        // cells[4] = año  (puede no existir)

        const regionRaw = cells[0].trim()
        if (regionRaw) lastRegion = regionRaw
        if (!lastRegion) return

        const oilType = toType(cells[1])
        if (!oilType) return

        const price = parsePrice(cells[2])
        if (!price) return

        const week = parseInt(cells[3]) || 0
        const year = parseInt(cells[4] ?? '') || new Date().getFullYear()
        const updatedAt = parseDate(cells[1])

        const entry = {
          type: oilType,
          price,
          priceMin: null,
          priceMax: null,
          change10d: null,
          unit: '€/kg',
          week,
          year,
          updatedAt,
        }

        if (!map.has(lastRegion)) map.set(lastRegion, [])
        map.get(lastRegion)!.push(entry)
      })
    })

    return Array.from(map.entries()).map(([region, prices]) => ({
      region,
      prices,
    }))
  }, BROWSER_HELPERS) as Promise<RegionEntry[]>
}

// ---------- main ----------

async function run() {
  const COUNTRY_KEYS = [
    'Italy',
    'Greece',
    'Portugal',
    'Turkiye',
    'Tunisia',
    'Lebanon',
  ]

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    locale: 'es-ES',
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
  })
  const page = await ctx.newPage()

  try {
    // ── /es/precios ──────────────────────────────────────────────────────
    const { summary, sections } = await scrapePricesPage(page)

    const national: PriceEntry[] = []
    const andalucia: PriceEntry[] = []
    const countries: CountryEntry[] = []

    for (const { heading, rows } of sections) {
      const h = heading.toLowerCase()
      if (h.includes('andaluc')) {
        andalucia.push(...(rows as PriceEntry[]))
      } else if (h.includes('spain') || h.includes('españa')) {
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

    // ── /es/precios/espana ───────────────────────────────────────────────
    const regions = await scrapeRegionsPage(page)

    const result: ScrapedPrices = {
      scrapedAt: new Date().toISOString(),
      spain: { summary, national, andalucia, regions },
      countries,
    }

    // ── Insertar en la base de datos ──────────────────────────────────────
    let totalInserted = 0

    totalInserted += await upsertPrices(result.spain.summary, 'España')
    totalInserted += await upsertPrices(result.spain.national, 'España')
    totalInserted += await upsertPrices(result.spain.andalucia, 'Andalucía')

    for (const { region, prices } of result.spain.regions) {
      totalInserted += await upsertPrices(prices, region)
    }

    for (const { country, prices } of result.countries) {
      totalInserted += await upsertPrices(prices, country)
    }
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('\n❌', err.message)
  process.exit(1)
})
