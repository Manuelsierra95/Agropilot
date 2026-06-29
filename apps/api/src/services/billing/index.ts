import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  AuthModule,
  AuthOrganization,
  BillingMeResponse,
  BillingModuleItem,
} from "@workspace/schemas"

export async function getBillingMe(
  organizationId: string,
  plan: AuthOrganization["plan"]
): Promise<BillingMeResponse> {
  const [subscription, limits, allModules, orgModules, usageCounts] =
    await Promise.all([
      db.query.subscriptions.findFirst({
        where: eq(schema.subscriptions.organizationId, organizationId),
      }),
      db.query.planLimits.findFirst({
        where: eq(schema.planLimits.plan, plan),
      }),
      db.query.modules.findMany(),
      db.query.organizationModules.findMany({
        where: eq(schema.organizationModules.organizationId, organizationId),
      }),
      getUsageCounts(organizationId),
    ])

  if (!limits) {
    throw new HTTPException(500, { message: "Plan limits not configured" })
  }

  const orgModuleMap = new Map(orgModules.map((m) => [m.moduleId, m]))

  const modules: BillingModuleItem[] = allModules.map((mod) => {
    const orgMod = orgModuleMap.get(mod.id)
    return {
      id: mod.id,
      slug: mod.slug,
      name: mod.name,
      description: mod.description,
      status: mod.status,
      active: orgMod?.active ?? false,
    }
  })

  return {
    subscription: subscription
      ? {
          status: subscription.status,
          stripePriceId: subscription.stripePriceId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
        }
      : null,
    limits: {
      maxParcels: limits.maxParcels,
      maxMembers: limits.maxMembers,
      maxStorageMb: limits.maxStorage,
      ...usageCounts,
    },
    modules,
  }
}

async function getUsageCounts(organizationId: string) {
  const [parcels, members] = await Promise.all([
    db.$count(
      schema.parcels,
      eq(schema.parcels.organizationId, organizationId)
    ),
    db.$count(
      schema.members,
      eq(schema.members.organizationId, organizationId)
    ),
  ])

  return {
    usedParcels: parcels,
    usedMembers: members,
    usedStorageMb: 0, // TODO: calcular cuando implementes storage
  }
}

export async function toggleModule(
  organizationId: string,
  slug: string,
  active: boolean
): Promise<void> {
  const mod = await db.query.modules.findFirst({
    where: eq(schema.modules.slug, slug as AuthModule["slug"]),
  })

  if (!mod) {
    throw new HTTPException(404, { message: "Module not found" })
  }

  if (mod.status === "coming_soon") {
    throw new HTTPException(400, { message: "Module not available yet" })
  }

  const existing = await db.query.organizationModules.findFirst({
    where: and(
      eq(schema.organizationModules.organizationId, organizationId),
      eq(schema.organizationModules.moduleId, mod.id)
    ),
  })

  if (existing) {
    await db
      .update(schema.organizationModules)
      .set({ active })
      .where(eq(schema.organizationModules.id, existing.id))
  } else {
    await db.insert(schema.organizationModules).values({
      id: crypto.randomUUID(),
      organizationId,
      moduleId: mod.id,
      active,
    })
  }
}
