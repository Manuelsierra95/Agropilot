import { db, schema } from "@workspace/db"

import {
  generateCampaigns,
  generateMarketPrices,
} from "../data/generators"

export type CatalogSeedResult = {
  campaigns: Awaited<ReturnType<typeof db.query.campaigns.findMany>>
}

export async function seedCatalog(): Promise<CatalogSeedResult> {
  await db
    .insert(schema.planLimits)
    .values([
      {
        id: crypto.randomUUID(),
        plan: "free",
        maxMembers: 2,
        maxParcels: 3,
        maxStorage: 100,
      },
      {
        id: crypto.randomUUID(),
        plan: "pro",
        maxMembers: 10,
        maxParcels: 50,
        maxStorage: 500,
      },
      {
        id: crypto.randomUUID(),
        plan: "enterprise",
        maxMembers: -1,
        maxParcels: -1,
        maxStorage: -1,
      },
    ])
    .onConflictDoNothing()

  console.log("✓ plan_limits")

  await db
    .insert(schema.modules)
    .values([
      {
        id: crypto.randomUUID(),
        slug: "ai-analysis",
        name: "Análisis IA",
        description: "Copiloto y análisis predictivo",
        status: "available",
      },
      {
        id: crypto.randomUUID(),
        slug: "field-notebook",
        name: "Cuaderno de campo",
        description: "Registro de labores y tratamientos",
        status: "available",
      },
      {
        id: crypto.randomUUID(),
        slug: "automations",
        name: "Automatizaciones",
        description: "Alertas y tareas automáticas",
        status: "coming_soon",
      },
    ])
    .onConflictDoNothing()

  console.log("✓ modules")

  const generatedCampaigns = generateCampaigns()
  await db
    .insert(schema.campaigns)
    .values(generatedCampaigns)
    .onConflictDoNothing()
  const campaigns = await db.query.campaigns.findMany()
  console.log(`✓ campaigns (${campaigns.length})`)

  const marketPrices = generateMarketPrices(90)
  if (marketPrices.length > 0) {
    await db.insert(schema.marketPrices).values(marketPrices)
    console.log(`✓ market_prices (${marketPrices.length} rows)`)
  }

  return { campaigns }
}
