/**
 * Seeds de dominio para desarrollo.
 *
 * 1. Inicia sesión con Google para crear user + org + member.
 * 2. Copia los UUIDs reales a src/config.ts.
 * 3. Ejecuta: pnpm --filter @workspace/seeds seed
 */
import { SeedError } from "./errors"
import { validateContext } from "./validate-context"
import { seedBilling } from "./seeds/billing"
import { seedCatalog } from "./seeds/catalog"
import { seedFinance } from "./seeds/finance"
import { seedInvitations } from "./seeds/invitations"
import { seedParcelWeather } from "./seeds/parcel-weather"
import { seedParcels } from "./seeds/parcels"
import { seedProduction } from "./seeds/production"
import { seedTasks } from "./seeds/tasks"

async function main() {
  console.log("Validando contexto de auth...")
  await validateContext()
  console.log("✓ user, organization y membership verificados\n")

  const { campaigns, weatherStations } = await seedCatalog()
  const { parcels } = await seedParcels(
    weatherStations.map((s) => s.id),
    campaigns.map((c) => ({ id: c.id, startDate: c.startDate }))
  )
  const parcelIds = parcels.map((p) => p.id)

  await seedParcelWeather(parcelIds)
  await seedFinance(parcelIds, campaigns)
  await seedProduction(parcelIds, campaigns)
  await seedTasks(parcelIds)
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
