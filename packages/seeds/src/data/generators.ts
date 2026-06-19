import { SEED_ORGANIZATION_ID, SEED_USER_ID } from "../config"

const GRADES = ["virgen_extra", "virgen", "lampante"] as const
const BASE_PRICES: Record<(typeof GRADES)[number], number> = {
  virgen_extra: 5.4,
  virgen: 4.6,
  lampante: 0.75,
}

export function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function eachDay(from: string, to: string): string[] {
  const dates: string[] = []
  const cursor = new Date(`${from}T12:00:00Z`)
  const end = new Date(`${to}T12:00:00Z`)
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

export function pointWkt(lng: number, lat: number) {
  return `POINT(${lng} ${lat})`
}

export function generateCampaigns() {
  return [
    {
      id: crypto.randomUUID(),
      name: "2025/2026",
      startDate: "2025-10-01",
      endDate: "2026-09-30",
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      name: "2024/2025",
      startDate: "2024-10-01",
      endDate: "2025-09-30",
      isActive: false,
    },
  ]
}

export function generateParcels() {
  const coords = [
    { lng: -3.3712, lat: 38.0112, name: "La Mata" },
    { lng: -3.3891, lat: 37.9934, name: "El Cerro" },
    { lng: -3.3521, lat: 38.0245, name: "Los Olivos" },
    { lng: -3.4102, lat: 37.9789, name: "Hoya Verde" },
  ] as const

  return coords.map((c, index) => {
    const areaHa = 6.3 + index * 2.1

    return {
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      name: c.name,
      cropType: "olive" as const,
      irrigationType: (index % 2 === 0 ? "dryland" : "irrigated") as
        | "dryland"
        | "irrigated",
      areaHa: areaHa.toFixed(4),
      areaM2: Math.round(areaHa * 10_000),
      centroid: pointWkt(c.lng, c.lat),
      polygon: `POLYGON((${c.lng} ${c.lat}, ${c.lng + 0.002} ${c.lat}, ${c.lng + 0.002} ${c.lat + 0.002}, ${c.lng} ${c.lat + 0.002}, ${c.lng} ${c.lat}))`,
    }
  })
}

export function generateWeatherStations() {
  return [
    {
      id: crypto.randomUUID(),
      stationId: "AEMET-JAE-01",
      name: "Estación Úbeda",
      location: pointWkt(-3.3712, 38.0112),
      altitude: 420,
    },
    {
      id: crypto.randomUUID(),
      stationId: "AEMET-BAE-02",
      name: "Estación Baeza",
      location: pointWkt(-3.3891, 37.9934),
      altitude: 485,
    },
    {
      id: crypto.randomUUID(),
      stationId: "AEMET-LIN-03",
      name: "Estación Linares",
      location: pointWkt(-3.3521, 38.0245),
      altitude: 360,
    },
  ]
}

export function generateMarketPrices(days = 90) {
  const end = new Date()
  const start = new Date()
  start.setUTCDate(end.getUTCDate() - days)

  const from = start.toISOString().slice(0, 10)
  const to = end.toISOString().slice(0, 10)
  const dates = eachDay(from, to)
  const rows: {
    id: string
    product: "olive_oil"
    grade: (typeof GRADES)[number]
    market: string
    price: string
    unit: string
    date: string
    currency: string
    source: string
  }[] = []

  dates.forEach((date, dayIndex) => {
    const seasonal = Math.sin((dayIndex / 30) * Math.PI)

    for (const grade of GRADES) {
      const base = BASE_PRICES[grade]
      const trend = dayIndex * 0.0004
      const noise = Math.sin(dayIndex / 17 + GRADES.indexOf(grade)) * 0.08
      const price = Math.max(0.4, base + seasonal * 0.25 + trend + noise)

      rows.push({
        id: crypto.randomUUID(),
        product: "olive_oil",
        grade,
        market: "Lonja Jaén",
        price: price.toFixed(4),
        unit: "€/kg",
        date,
        currency: "EUR",
        source: "seed",
      })
    }
  })

  return rows
}

export function generateTransactions(
  parcelIds: string[],
  campaignId: string
) {
  const categories = [
    "irrigation",
    "fertilization",
    "treatment",
    "labor",
    "machinery",
    "fuel",
    "harvest",
    "sale",
    "subsidy",
    "other",
  ] as const

  const rows: {
    id: string
    organizationId: string
    parcelId: string
    userId: string
    concept: string
    description: string
    flow: "income" | "expense"
    date: string
    category: (typeof categories)[number] | "sale"
    amount: string
    campaignId: string
    paymentMethod: "transferencia"
    invoiceNumber: string | null
  }[] = []

  for (let i = 0; i < 120; i++) {
    const date = isoDate(2025, (i % 12) + 1, (i % 27) + 1)
    const isIncome = i % 4 === 0
    const parcelId = parcelIds[i % parcelIds.length]!

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      userId: SEED_USER_ID,
      concept: isIncome ? "Venta aceite" : "Gasto explotación",
      description: isIncome ? "Liquidación cooperativa" : "Operación de campo",
      flow: isIncome ? ("income" as const) : ("expense" as const),
      date,
      category: isIncome ? ("sale" as const) : categories[i % categories.length]!,
      amount: (isIncome ? 1200 + (i % 9) * 340 : 180 + (i % 7) * 95).toFixed(2),
      campaignId,
      paymentMethod: "transferencia" as const,
      invoiceNumber: isIncome ? `FAC-2025-${String(i + 1).padStart(4, "0")}` : null,
    })
  }

  return rows
}

export function generateParcelCashflow(
  parcelIds: string[],
  campaignId: string
) {
  const dates = eachDay("2025-10-01", "2026-06-08")
  const rows: {
    id: string
    parcelId: string
    campaignId: string
    date: string
    income: string
    expense: string
  }[] = []

  for (const parcelId of parcelIds) {
    for (const [index, date] of dates.entries()) {
      const income =
        index % 14 === 0 ? 1800 + index * 3 : index % 9 === 0 ? 420 : 0
      const expense =
        index % 11 === 0 ? 260 + index : index % 7 === 0 ? 90 : 0

      rows.push({
        id: crypto.randomUUID(),
        parcelId,
        campaignId,
        date,
        income: income.toFixed(2),
        expense: expense.toFixed(2),
      })
    }
  }

  return rows
}

export function generateFinancialSummaries(
  parcelIds: string[],
  campaigns: { id: string }[]
) {
  const rows: {
    id: string
    parcelId: string
    campaignId: string
    totalIncome: string
    totalExpense: string
    profit: string
    totalKg: string
    costPerKg: string
    revenuePerKg: string
    marginPerKg: string
    avgMarketPrice: string
    marginVsMarket: string
    expectedYieldKg: string
    expectedRevenue: string
    expectedProfit: string
  }[] = []

  for (const campaign of campaigns) {
    parcelIds.forEach((parcelId, index) => {
      const income = 18000 + index * 2400
      const expense = 9200 + index * 1100

      rows.push({
        id: crypto.randomUUID(),
        parcelId,
        campaignId: campaign.id,
        totalIncome: income.toFixed(2),
        totalExpense: expense.toFixed(2),
        profit: (income - expense).toFixed(2),
        totalKg: (6200 + index * 800).toFixed(2),
        costPerKg: (expense / (6200 + index * 800)).toFixed(4),
        revenuePerKg: (income / (6200 + index * 800)).toFixed(4),
        marginPerKg: ((income - expense) / (6200 + index * 800)).toFixed(4),
        avgMarketPrice: "5.2000",
        marginVsMarket: "0.8500",
        expectedYieldKg: (7000 + index * 500).toFixed(2),
        expectedRevenue: (36000 + index * 4200).toFixed(2),
        expectedProfit: (18000 + index * 2100).toFixed(2),
      })
    })
  }

  return rows
}

export function generateParcelWeatherData(parcelIds: string[]) {
  const dates = eachDay("2025-01-01", "2026-06-08")

  return parcelIds.map((parcelId) => {
    const daily = dates.map((date, index) => {
      const seasonal = Math.sin((index / 30) * Math.PI)
      return {
        date,
        soilMoisture: Math.round(28 + seasonal * 12 + (index % 5)),
        rainfall: Math.max(0, Math.round(seasonal * 18 + (index % 3) * 2)),
        temperature: Math.round(14 + seasonal * 8 + (index % 4)),
      }
    })

    return {
      id: crypto.randomUUID(),
      parcelId,
      rangeStart: dates[0]!,
      rangeEnd: dates.at(-1)!,
      status: "ok" as const,
      data: { daily },
      metrics: {
        avgTemperature: 18.4,
        totalRainfall: 412,
        avgSoilMoisture: 31.2,
      },
      risks: {
        frost: "low",
        drought: "medium",
        pest: "low",
      },
      recommendations: ["Revisar riego en parcelas de secano"],
      algorithmVersion: "seed-v1",
    }
  })
}

export function generateTasks(parcelIds: string[]) {
  const categories = [
    "irrigation",
    "fertilization",
    "treatment",
    "harvest",
    "inspection",
  ] as const
  const statuses = ["pending", "in_progress", "done", "skipped"] as const
  const rows: {
    id: string
    organizationId: string
    parcelId: string
    taskType: "recommended" | "manual"
    category: (typeof categories)[number]
    title: string
    description: string
    startDate: Date
    endDate: Date | null
    status: (typeof statuses)[number]
    priority: number
    source: "weather" | "manual"
    sourceId: null
    meta: { seeded: boolean }
  }[] = []

  for (let i = 0; i < 48; i++) {
    const parcelId = parcelIds[i % parcelIds.length]!
    const month = (i % 12) + 1

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      taskType: i % 3 === 0 ? ("recommended" as const) : ("manual" as const),
      category: categories[i % categories.length]!,
      title: `Tarea ${categories[i % categories.length]} — parcela ${i + 1}`,
      description: "Generada por seed de desarrollo",
      startDate: new Date(`${isoDate(2026, month, (i % 20) + 1)}T08:00:00Z`),
      endDate:
        i % 5 === 0
          ? null
          : new Date(`${isoDate(2026, month, (i % 20) + 3)}T18:00:00Z`),
      status: statuses[i % statuses.length]!,
      priority: i % 4,
      source: i % 2 === 0 ? ("weather" as const) : ("manual" as const),
      sourceId: null,
      meta: { seeded: true },
    })
  }

  return rows
}

export function generateParcelCrops(parcelIds: string[]) {
  const varieties = ["Picual", "Hojiblanca", "Arbequina", "Cornicabra"] as const
  const soilTypes = ["arcilloso", "franco-arcilloso", "franco-arenoso", "calizo"] as const

  return parcelIds.map((parcelId, index) => ({
    id: crypto.randomUUID(),
    parcelId,
    variety: varieties[index % varieties.length]!,
    soilType: soilTypes[index % soilTypes.length]!,
    plantingDate: new Date(isoDate(2018 + (index % 5), 11, 15)),
    plantCount: 800 + index * 200,
    data: {
      type: index % 2 === 0 ? "intensivo" : "tradicional",
      rowSpacing: index % 2 === 0 ? 7 : 10,
      plantSpacing: index % 2 === 0 ? 5 : 8,
    },
  }))
}

export function generateParcelCropSeasons(
  parcelIds: string[],
  campaigns: { id: string; startDate: string }[]
) {
  const rows: {
    id: string
    parcelId: string
    campaignId: string
    year: number
    yieldActualKg: string | null
    yieldTargetKg: string | null
    expectedYieldKg: string | null
    targetPricePerKg: string | null
    notes: string | null
  }[] = []

  for (const campaign of campaigns) {
    const year = Number.parseInt(campaign.startDate.slice(0, 4), 10)

    parcelIds.forEach((parcelId, index) => {
      const baseYield = 6200 + index * 800
      rows.push({
        id: crypto.randomUUID(),
        parcelId,
        campaignId: campaign.id,
        year,
        yieldActualKg: campaign.startDate < "2026-01-01"
          ? (baseYield + (index % 3) * 200).toFixed(2)
          : null,
        yieldTargetKg: (baseYield + 500).toFixed(2),
        expectedYieldKg: (baseYield + 300).toFixed(2),
        targetPricePerKg: "5.5000",
        notes: index % 3 === 0 ? "Campaña consequat" : null,
      })
    })
  }

  return rows
}

export function generateHarvestDeliveries(
  parcelIds: string[],
  campaigns: { id: string }[]
) {
  const destinations = ["Cooperativa San Francisco", "Almazara La Ermita", "Bodega El Campillo"] as const
  const grades = ["virgen_extra", "virgen", "lampante"] as const
  const activeCampaign = campaigns[0]

  if (!activeCampaign) return []

  const rows: {
    id: string
    organizationId: string
    parcelId: string
    campaignId: string
    deliveryDate: string
    destinationName: string
    rawQuantity: string
    rawUnit: string
    conversionRate: string
    processedQuantity: string
    processedUnit: string
    grade: string
    quantityRemaining: string
    status: "stored" | "partial" | "sold"
    targetSalePricePerUnit: string
    notes: string | null
  }[] = []

  parcelIds.forEach((parcelId, index) => {
    const rawQty = 12000 + index * 2500
    const convRate = 18 + (index % 3) * 2
    const processedQty = Math.round((rawQty * convRate) / 100)
    const isPartial = index % 3 === 0

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      campaignId: activeCampaign.id,
      deliveryDate: isoDate(2025, 11, 10 + index),
      destinationName: destinations[index % destinations.length]!,
      rawQuantity: rawQty.toFixed(2),
      rawUnit: "kg",
      conversionRate: convRate.toFixed(2),
      processedQuantity: processedQty.toFixed(2),
      processedUnit: "l",
      grade: grades[index % grades.length]!,
      quantityRemaining: isPartial
        ? (processedQty * 0.4).toFixed(2)
        : processedQty.toFixed(2),
      status: isPartial ? "partial" : "stored",
      targetSalePricePerUnit: "5.8000",
      notes: isPartial ? "Venta parcial a cooperativa" : null,
    })
  })

  return rows
}

export function generateHarvestSales(
  deliveries: { id: string; parcelId: string; campaignId: string; processedQuantity: string; grade: string | null }[]
) {
  const buyers = ["Cooperativa San Francisco", "Almazara La Ermita", "Distribuidora Sur"] as const
  const pricesByGrade: Record<string, number> = {
    virgen_extra: 6.2,
    virgen: 5.1,
    lampante: 1.8,
  }

  const rows: {
    id: string
    organizationId: string
    deliveryId: string
    parcelId: string
    campaignId: string
    transactionId: string | null
    saleDate: string
    quantitySold: string
    pricePerUnit: string
    totalAmount: string
    buyerName: string
    notes: string | null
  }[] = []

  deliveries.forEach((delivery, index) => {
    const qty = Number.parseFloat(delivery.processedQuantity)
    const soldQty = index % 3 === 0 ? Math.round(qty * 0.6) : qty
    const grade = delivery.grade ?? "virgen_extra"
    const price = pricesByGrade[grade] ?? 5.0

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      deliveryId: delivery.id,
      parcelId: delivery.parcelId,
      campaignId: delivery.campaignId,
      transactionId: null,
      saleDate: isoDate(2025, 12, 5 + index),
      quantitySold: soldQty.toFixed(2),
      pricePerUnit: price.toFixed(4),
      totalAmount: (soldQty * price).toFixed(2),
      buyerName: buyers[index % buyers.length]!,
      notes: index % 3 === 0 ? "Entrega parcial" : null,
    })
  })

  return rows
}
