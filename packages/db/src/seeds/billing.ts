import { db, schema } from "src"

export async function billingSeeds() {
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

  console.log("✓ planLimits seeded (on conflict do nothing)")
  process.exit(0)
}
