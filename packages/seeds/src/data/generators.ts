import { SEED_ORGANIZATION_ID, SEED_USER_ID } from "../config"

const GRADES = ["virgen_extra", "virgen", "lampante"] as const
const BASE_PRICES: Record<(typeof GRADES)[number], number> = {
  virgen_extra: 5.4,
  virgen: 4.6,
  lampante: 0.75,
}

export const CAMPAIGN_IDS = {
  active: "00000000-0000-4000-8000-000000000101",
  previous: "00000000-0000-4000-8000-000000000102",
} as const

type DashboardRiskLevel = "low" | "medium" | "high"

function buildRiskDetail(
  level: DashboardRiskLevel,
  score: number,
  reasons: string[]
) {
  return { level, score, reasons }
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
      id: CAMPAIGN_IDS.active,
      name: "2025/2026",
      startDate: "2025-10-01",
      endDate: "2026-09-30",
      isActive: true,
    },
    {
      id: CAMPAIGN_IDS.previous,
      name: "2024/2025",
      startDate: "2024-10-01",
      endDate: "2025-09-30",
      isActive: false,
    },
  ]
}

export function generateMarketPrices(days = 90) {
  const end = new Date()
  const start = new Date()
  start.setUTCDate(end.getUTCDate() - days)

  const from = start.toISOString().slice(0, 10)
  const dates = eachDay(from, end.toISOString().slice(0, 10))
  const rows: {
    id: string
    product: "olive_oil"
    grade: (typeof GRADES)[number]
    market: string
    price: string
    unit: string
    date: string
    currency: string
    trend: "up" | "down" | "stable"
    source: string
  }[] = []

  dates.forEach((date, dayIndex) => {
    const seasonal = Math.sin((dayIndex / 30) * Math.PI)

    for (const grade of GRADES) {
      const base = BASE_PRICES[grade]
      const trendValue = dayIndex * 0.0004
      const noise = Math.sin(dayIndex / 17 + GRADES.indexOf(grade)) * 0.08
      const price = Math.max(0.4, base + seasonal * 0.25 + trendValue + noise)
      const trend: "up" | "down" | "stable" =
        trendValue > 0.01 ? "up" : trendValue < -0.01 ? "down" : "stable"

      rows.push({
        id: crypto.randomUUID(),
        product: "olive_oil",
        grade,
        market: "Lonja Jaén",
        price: price.toFixed(4),
        unit: "€/kg",
        date,
        currency: "EUR",
        trend,
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
  const expenseCategories = [
    "irrigation",
    "fertilization",
    "treatment",
    "labor",
    "machinery",
    "fuel",
    "harvest",
    "other",
  ] as const

  const expenseConcepts: Record<(typeof expenseCategories)[number], string> = {
    irrigation: "Riego por goteo",
    fertilization: "Abonado de fondo",
    treatment: "Tratamiento contra repilo",
    labor: "Poda de formación",
    machinery: "Alquiler vibradora",
    fuel: "Gasoil maquinaria",
    harvest: "Cosecha mecánica",
    other: "Seguro agrario",
  }

  const rows: {
    id: string
    organizationId: string
    parcelId: string
    userId: string
    concept: string
    description: string
    flow: "income" | "expense"
    date: string
    category: (typeof expenseCategories)[number] | "subsidy"
    amount: string
    campaignId: string
    paymentMethod: "transferencia"
    invoiceNumber: string | null
  }[] = []

  const campaignDates = eachDay("2025-10-01", "2026-06-08")

  for (let i = 0; i < 96; i++) {
    const date = campaignDates[i % campaignDates.length]!
    const parcelId = parcelIds[i % parcelIds.length]!
    const category = expenseCategories[i % expenseCategories.length]!

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      userId: SEED_USER_ID,
      concept: expenseConcepts[category],
      description: "Operación registrada en explotación olivarera",
      flow: "expense",
      date,
      category,
      amount: (180 + (i % 7) * 95 + (i % 3) * 40).toFixed(2),
      campaignId,
      paymentMethod: "transferencia",
      invoiceNumber: null,
    })
  }

  if (parcelIds.length > 0) {
    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId: parcelIds[0]!,
      userId: SEED_USER_ID,
      concept: "Ayuda PAC olivar",
      description: "Pago de subvención de la campaña",
      flow: "income",
      date: isoDate(2026, 3, 15),
      category: "subsidy",
      amount: "2400.00",
      campaignId,
      paymentMethod: "transferencia",
      invoiceNumber: "SUB-2026-001",
    })
  }

  return rows
}

export function generateSaleTransactions(
  deliveries: {
    id: string
    parcelId: string
    campaignId: string
    processedQuantity: string
    grade: string | null
  }[]
) {
  const pricesByGrade: Record<string, number> = {
    virgen_extra: 6.2,
    virgen: 5.1,
    lampante: 1.8,
  }

  return deliveries.map((delivery, index) => {
    const qty = Number.parseFloat(delivery.processedQuantity)
    const soldQty = index % 3 === 0 ? Math.round(qty * 0.6) : qty
    const grade = delivery.grade ?? "virgen_extra"
    const price = pricesByGrade[grade] ?? 5.0
    const amount = soldQty * price

    return {
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId: delivery.parcelId,
      userId: SEED_USER_ID,
      concept: "Venta aceite de oliva",
      description: `Liquidación cooperativa — entrega ${delivery.id.slice(0, 8)}`,
      flow: "income" as const,
      date: isoDate(2025, 12, 5 + index),
      category: "sale" as const,
      amount: amount.toFixed(2),
      campaignId: delivery.campaignId,
      paymentMethod: "transferencia" as const,
      invoiceNumber: `VTA-2025-${String(index + 1).padStart(4, "0")}`,
      deliveryId: delivery.id,
      saleAmount: amount,
    }
  })
}

export function generateParcelCashflow(
  parcelIds: string[],
  campaignId: string,
  transactions: { parcelId: string | null; date: string; flow: string; amount: string }[]
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
    const parcelTx = transactions.filter((tx) => tx.parcelId === parcelId)

    for (const date of dates) {
      const dayTx = parcelTx.filter((tx) => tx.date === date)
      const income = dayTx
        .filter((tx) => tx.flow === "income")
        .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)
      const expense = dayTx
        .filter((tx) => tx.flow === "expense")
        .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)

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
  campaigns: { id: string }[],
  transactions: {
    parcelId: string | null
    campaignId: string
    flow: string
    amount: string
  }[]
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
      const parcelTx = transactions.filter(
        (tx) => tx.parcelId === parcelId && tx.campaignId === campaign.id
      )
      const income = parcelTx
        .filter((tx) => tx.flow === "income")
        .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)
      const expense = parcelTx
        .filter((tx) => tx.flow === "expense")
        .reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)
      const profit = income - expense
      const totalKg = 6200 + index * 800

      rows.push({
        id: crypto.randomUUID(),
        parcelId,
        campaignId: campaign.id,
        totalIncome: income.toFixed(2),
        totalExpense: expense.toFixed(2),
        profit: profit.toFixed(2),
        totalKg: totalKg.toFixed(2),
        costPerKg: (expense / totalKg).toFixed(4),
        revenuePerKg: (income / totalKg).toFixed(4),
        marginPerKg: (profit / totalKg).toFixed(4),
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

function buildRisks(index: number) {
  const levels: DashboardRiskLevel[] = ["low", "medium", "high"]
  const waterLevel = levels[index % 3]!
  const fungalLevel = levels[(index + 1) % 3]!
  const insectLevel = levels[(index + 2) % 3]!
  const thermalLevel = levels[index % 2]!

  return {
    waterStress: buildRiskDetail(waterLevel, 20 + index * 12, [
      "Déficit hídrico en suelo",
      "Evapotranspiración elevada",
    ]),
    fungalRisk: buildRiskDetail(fungalLevel, 15 + index * 10, [
      "Humedad relativa favorable a hongos",
    ]),
    insectRisk: buildRiskDetail(insectLevel, 10 + index * 8, [
      "Presión de mosca del olivo",
    ]),
    thermalStress: buildRiskDetail(thermalLevel, 12 + index * 9, [
      "Temperaturas máximas en floración",
    ]),
  }
}

export function generateParcelWeatherData(parcelIds: string[]) {
  const dates = eachDay("2025-01-01", "2026-06-08")

  return parcelIds.map((parcelId, index) => {
    const daily = dates.map((date, dayIndex) => {
      const seasonal = Math.sin((dayIndex / 30) * Math.PI)
      return {
        date,
        soilMoisture: Math.round(28 + seasonal * 12 + (index % 5)),
        rainfall: Math.max(0, Math.round(seasonal * 18 + (dayIndex % 3) * 2)),
        temperature: Math.round(14 + seasonal * 8 + (dayIndex % 4)),
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
      risks: buildRisks(index),
      algorithmVersion: "seed-v1",
    }
  })
}

export function generateRecommendationRows(parcelIds: string[]) {
  const parcelTemplates = [
    {
      type: "irrigation" as const,
      source: "weather" as const,
      title: "Programar riego de refuerzo",
      details: "El balance hídrico indica déficit moderado en los próximos días.",
      priority: "high" as const,
    },
    {
      type: "treatment" as const,
      source: "risk_engine" as const,
      title: "Tratamiento preventivo contra repilo",
      details: "Condiciones de humedad y temperatura favorables al desarrollo fúngico.",
      priority: "medium" as const,
    },
  ]

  const orgTemplates = [
    {
      type: "sale" as const,
      source: "market" as const,
      title: "Ventana de venta favorable",
      details: "El precio del aceite en la Lonja de Jaén muestra tendencia alcista.",
      priority: "low" as const,
    },
    {
      type: "general" as const,
      source: "copilot" as const,
      title: "Revisar calendario de labores",
      details: "Hay tareas de poda y tratamiento pendientes para esta semana.",
      priority: "medium" as const,
    },
  ]

  function expiresInDays(days: number): Date {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() + days)
    return date
  }

  const rows: {
    id: string
    organizationId: string
    parcelId: string | null
    dedupeKey: string
    type: (typeof parcelTemplates)[number]["type"] | (typeof orgTemplates)[number]["type"]
    source: (typeof parcelTemplates)[number]["source"] | (typeof orgTemplates)[number]["source"]
    title: string
    details: string
    priority: "low" | "medium" | "high"
    status: "pending"
    expiresAt: Date
  }[] = []

  for (const parcelId of parcelIds) {
    for (const [index, template] of parcelTemplates.entries()) {
      rows.push({
        id: crypto.randomUUID(),
        organizationId: SEED_ORGANIZATION_ID,
        parcelId,
        dedupeKey: `seed:${template.type}:${parcelId}:${index}`,
        type: template.type,
        source: template.source,
        title: template.title,
        details: template.details,
        priority: template.priority,
        status: "pending",
        expiresAt: expiresInDays(7),
      })
    }
  }

  for (const [index, template] of orgTemplates.entries()) {
    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId: null,
      dedupeKey: `seed:${template.type}:org:${index}`,
      type: template.type,
      source: template.source,
      title: template.title,
      details: template.details,
      priority: template.priority,
      status: "pending",
      expiresAt: expiresInDays(7),
    })
  }

  return rows
}

export function generateTasks(
  parcelIds: string[],
  recommendations: { id: string; parcelId: string | null; type: string }[]
) {
  const categories = [
    "irrigation",
    "fertilization",
    "treatment",
    "harvest",
    "inspection",
  ] as const

  const rows: {
    id: string
    organizationId: string
    parcelId: string
    taskType: "recommended" | "manual"
    category: string
    title: string
    description: string
    startDate: Date
    endDate: Date | null
    status: "pending" | "in_progress" | "done" | "skipped"
    priority: number
    source: "weather" | "manual" | "risk_engine"
    sourceId: string | null
    recommendationId: string | null
    meta: { seeded: boolean }
  }[] = []

  const now = new Date()
  const upcomingStart = new Date(now)
  upcomingStart.setUTCDate(upcomingStart.getUTCDate() + 1)
  upcomingStart.setUTCHours(8, 0, 0, 0)

  for (let i = 0; i < 12; i++) {
    const parcelId = parcelIds[i % parcelIds.length]!
    const startDate = new Date(upcomingStart)
    startDate.setUTCDate(startDate.getUTCDate() + (i % 7))
    const endDate = new Date(startDate)
    endDate.setUTCDate(endDate.getUTCDate() + 1)

    const matchingRec = recommendations.find(
      (rec) =>
        rec.parcelId === parcelId &&
        (rec.type === categories[i % categories.length] ||
          (rec.type === "treatment" &&
            categories[i % categories.length] === "treatment"))
    )

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      taskType: matchingRec ? "recommended" : "manual",
      category: categories[i % categories.length]!,
      title: `${categories[i % categories.length] === "irrigation" ? "Revisar riego" : "Labor de campo"} — semana ${i + 1}`,
      description: "Tarea programada para la semana en curso",
      startDate,
      endDate,
      status: i % 4 === 0 ? "in_progress" : "pending",
      priority: i % 3,
      source:
        matchingRec?.type === "treatment"
          ? "risk_engine"
          : matchingRec
            ? "weather"
            : "manual",
      sourceId: matchingRec?.id ?? null,
      recommendationId: matchingRec?.id ?? null,
      meta: { seeded: true },
    })
  }

  const campaignDates = eachDay("2025-10-01", "2026-05-30")

  for (let i = 0; i < 36; i++) {
    const parcelId = parcelIds[i % parcelIds.length]!
    const date = campaignDates[i % campaignDates.length]!

    rows.push({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      parcelId,
      taskType: i % 3 === 0 ? "recommended" : "manual",
      category: categories[i % categories.length]!,
      title: `Tarea ${categories[i % categories.length]} — campaña`,
      description: "Registro histórico de labores en olivar",
      startDate: new Date(`${date}T08:00:00Z`),
      endDate:
        i % 5 === 0
          ? null
          : new Date(`${date}T18:00:00Z`),
      status: i % 4 === 0 ? "done" : "pending",
      priority: i % 4,
      source: i % 2 === 0 ? "weather" : "manual",
      sourceId: null,
      recommendationId: null,
      meta: { seeded: true },
    })
  }

  return rows
}

export function generateParcelCrops(parcelIds: string[]) {
  const varieties = ["Picual", "Hojiblanca", "Arbequina", "Cornicabra"] as const
  const soilTypes = [
    "arcilloso",
    "franco-arcilloso",
    "franco-arenoso",
    "calizo",
  ] as const

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
    yieldActualKg: string | null
    yieldTargetKg: string | null
    expectedYieldKg: string | null
    targetPricePerKg: string | null
    notes: string | null
  }[] = []

  for (const campaign of campaigns) {
    parcelIds.forEach((parcelId, index) => {
      const baseYield = 6200 + index * 800
      rows.push({
        id: crypto.randomUUID(),
        parcelId,
        campaignId: campaign.id,
        yieldActualKg:
          campaign.startDate < "2026-01-01"
            ? (baseYield + (index % 3) * 200).toFixed(2)
            : null,
        yieldTargetKg: (baseYield + 500).toFixed(2),
        expectedYieldKg: (baseYield + 300).toFixed(2),
        targetPricePerKg: "5.5000",
        notes:
          index % 3 === 0
            ? "Campaña con buena acumulación de aceite en almazara"
            : null,
      })
    })
  }

  return rows
}

export function generateHarvestDeliveries(
  parcelIds: string[],
  campaigns: { id: string }[]
) {
  const destinations = [
    "Cooperativa San Francisco",
    "Almazara Nuestra Señora de la Paz",
    "Almazara La Ermita",
    "Cooperativa Olivarera de Martos",
  ] as const
  const grades = ["virgen_extra", "virgen", "lampante"] as const
  const activeCampaign = campaigns.find((c) => c.id === CAMPAIGN_IDS.active) ?? campaigns[0]

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
        : "0.00",
      status: isPartial ? "partial" : "sold",
      targetSalePricePerUnit: "5.8000",
      notes: isPartial ? "Venta parcial a cooperativa" : "Cosecha entregada en almazara",
    })
  })

  return rows
}

export function generateHarvestSales(
  deliveries: {
    id: string
    parcelId: string
    campaignId: string
    processedQuantity: string
    grade: string | null
  }[],
  saleTransactions: { id: string; deliveryId: string; saleAmount: number }[]
) {
  const buyers = [
    "Cooperativa San Francisco",
    "Almazara La Ermita",
    "Distribuidora Aceites del Sur",
  ] as const
  const pricesByGrade: Record<string, number> = {
    virgen_extra: 6.2,
    virgen: 5.1,
    lampante: 1.8,
  }

  const txByDelivery = new Map(
    saleTransactions.map((tx) => [tx.deliveryId, tx])
  )

  return deliveries.map((delivery, index) => {
    const qty = Number.parseFloat(delivery.processedQuantity)
    const soldQty = index % 3 === 0 ? Math.round(qty * 0.6) : qty
    const grade = delivery.grade ?? "virgen_extra"
    const price = pricesByGrade[grade] ?? 5.0
    const saleTx = txByDelivery.get(delivery.id)

    return {
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      deliveryId: delivery.id,
      parcelId: delivery.parcelId,
      campaignId: delivery.campaignId,
      transactionId: saleTx?.id ?? null,
      saleDate: isoDate(2025, 12, 5 + index),
      quantitySold: soldQty.toFixed(2),
      pricePerUnit: price.toFixed(4),
      totalAmount: (saleTx?.saleAmount ?? soldQty * price).toFixed(2),
      buyerName: buyers[index % buyers.length]!,
      notes: index % 3 === 0 ? "Entrega parcial" : null,
    }
  })
}
