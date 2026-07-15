/**
 * Seeds de dominio para desarrollo y demo pública.
 *
 * Ejecutar: pnpm seed
 * Requiere: DEMO_USER_PASSWORD y DATABASE_URL en packages/db/.env
 */
import { clearOrgData } from "./clear-org-data"
import { SeedError } from "./errors"
import { validateContext } from "./validate-context"
import { generateHarvestDeliveries } from "./data/generators"
import { seedBilling } from "./seeds/billing"
import { seedCatalog } from "./seeds/catalog"
import { seedDemoAuth } from "./seeds/demo-auth"
import { seedFinance } from "./seeds/finance"
import { seedInvitations } from "./seeds/invitations"
import { seedParcelWeather } from "./seeds/parcel-weather"
import { seedParcels } from "./seeds/parcels"
import { seedProduction } from "./seeds/production"
import { seedRecommendations } from "./seeds/recommendations"
import { seedTasks } from "./seeds/tasks"

async function main() {
  console.log("Creando usuario demo...")
  await seedDemoAuth()

  console.log("Validando contexto demo...")
  await validateContext()
  console.log("✓ user, organization y membership verificados\n")

  await clearOrgData()

  const { campaigns } = await seedCatalog()
  const campaignRows = campaigns.map((c) => ({
    id: c.id,
    startDate: c.startDate,
    isActive: c.isActive,
  }))

  const { parcels } = await seedParcels(
    campaigns.map((c) => ({ id: c.id, startDate: c.startDate }))
  )
  const parcelIds = parcels.map((p) => p.id)

  await seedParcelWeather(parcelIds)
  const recommendations = await seedRecommendations(parcelIds)

  const deliveries = generateHarvestDeliveries(parcelIds, campaignRows)
  const saleTransactions =
    (await seedFinance(parcelIds, campaignRows, deliveries)) ?? []

  await seedProduction(parcelIds, campaignRows, saleTransactions)
  await seedTasks(parcelIds, recommendations)
  await seedBilling()
  await seedInvitations()

  console.log("\n✅ Seeds completados")
}

main().catch((err) => {
  if (err instanceof SeedError) {
    console.error(`\n❌ Seed error [${err.code}]: ${err.message}`)
    process.exit(1)
  }

  console.error(err)
  process.exit(1)
})
