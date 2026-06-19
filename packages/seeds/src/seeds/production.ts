import { db, schema } from "@workspace/db"

import {
  generateHarvestDeliveries,
  generateHarvestSales,
} from "../data/generators"

export async function seedProduction(
  parcelIds: string[],
  campaigns: { id: string }[]
) {
  const deliveries = generateHarvestDeliveries(parcelIds, campaigns)
  if (deliveries.length === 0) {
    console.log("⊘ harvest_deliveries (no campaigns)")
    return
  }

  await db.insert(schema.harvestDeliveries).values(deliveries)
  console.log(`✓ harvest_deliveries (${deliveries.length})`)

  const sales = generateHarvestSales(deliveries)
  await db.insert(schema.harvestSales).values(sales)
  console.log(`✓ harvest_sales (${sales.length})`)
}
