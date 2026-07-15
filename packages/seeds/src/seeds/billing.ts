import { db, schema } from "@workspace/db"

import { SEED_ORGANIZATION_ID } from "../config"

export async function seedBilling() {
  await db
    .insert(schema.subscriptions)
    .values({
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      stripeCustomerId: `cus_seed_${SEED_ORGANIZATION_ID.slice(0, 8)}`,
      stripeSubscriptionId: `sub_seed_${SEED_ORGANIZATION_ID.slice(0, 8)}`,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .onConflictDoNothing()

  console.log("✓ subscriptions")

  const modules = await db.query.modules.findMany()
  if (modules.length > 0) {
    await db
      .insert(schema.organizationModules)
      .values(
        modules.map((mod) => ({
          id: crypto.randomUUID(),
          organizationId: SEED_ORGANIZATION_ID,
          moduleId: mod.id,
          active: true,
        }))
      )
      .onConflictDoNothing()

    console.log(`✓ organization_modules (${modules.length})`)
  }
}
