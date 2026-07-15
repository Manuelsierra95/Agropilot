import { eq, inArray, db, schema } from "@workspace/db"

import { DEMO_ORGANIZATION_ID } from "./config"

export async function clearOrgData() {
  const parcels = await db.query.parcels.findMany({
    where: eq(schema.parcels.organizationId, DEMO_ORGANIZATION_ID),
    columns: { id: true },
  })
  const parcelIds = parcels.map((p) => p.id)

  if (parcelIds.length > 0) {
    await db
      .delete(schema.harvestSales)
      .where(inArray(schema.harvestSales.parcelId, parcelIds))
    await db
      .delete(schema.harvestDeliveries)
      .where(inArray(schema.harvestDeliveries.parcelId, parcelIds))
    await db.delete(schema.tasks).where(inArray(schema.tasks.parcelId, parcelIds))
    await db
      .delete(schema.recommendations)
      .where(eq(schema.recommendations.organizationId, DEMO_ORGANIZATION_ID))
    await db
      .delete(schema.parcelCashflowDaily)
      .where(inArray(schema.parcelCashflowDaily.parcelId, parcelIds))
    await db
      .delete(schema.parcelFinancialSummaries)
      .where(inArray(schema.parcelFinancialSummaries.parcelId, parcelIds))
    await db
      .delete(schema.transactions)
      .where(eq(schema.transactions.organizationId, DEMO_ORGANIZATION_ID))
    await db
      .delete(schema.parcelWeather)
      .where(inArray(schema.parcelWeather.parcelId, parcelIds))
    await db
      .delete(schema.parcelCropSeasons)
      .where(inArray(schema.parcelCropSeasons.parcelId, parcelIds))
    await db
      .delete(schema.parcelCrops)
      .where(inArray(schema.parcelCrops.parcelId, parcelIds))
    await db
      .delete(schema.parcelStation)
      .where(inArray(schema.parcelStation.parcelId, parcelIds))
    await db
      .delete(schema.parcelLocation)
      .where(inArray(schema.parcelLocation.parcelId, parcelIds))
    await db.delete(schema.parcels).where(inArray(schema.parcels.id, parcelIds))
  } else {
    await db
      .delete(schema.recommendations)
      .where(eq(schema.recommendations.organizationId, DEMO_ORGANIZATION_ID))
    await db
      .delete(schema.transactions)
      .where(eq(schema.transactions.organizationId, DEMO_ORGANIZATION_ID))
  }

  await db
    .delete(schema.invitations)
    .where(eq(schema.invitations.organizationId, DEMO_ORGANIZATION_ID))
  await db
    .delete(schema.organizationModules)
    .where(eq(schema.organizationModules.organizationId, DEMO_ORGANIZATION_ID))
  await db
    .delete(schema.subscriptions)
    .where(eq(schema.subscriptions.organizationId, DEMO_ORGANIZATION_ID))
  await db
    .delete(schema.organizationRoles)
    .where(eq(schema.organizationRoles.organizationId, DEMO_ORGANIZATION_ID))

  await db.delete(schema.marketPrices).where(eq(schema.marketPrices.source, "seed"))

  console.log("✓ cleared demo organization data")
}
