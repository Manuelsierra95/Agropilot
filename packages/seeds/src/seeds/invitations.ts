import { db, schema } from "@workspace/db"

import { SEED_ORGANIZATION_ID, SEED_USER_ID } from "../config"

export async function seedInvitations() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(schema.invitations).values([
    {
      id: crypto.randomUUID(),
      email: "invitado.demo@agropilot.dev",
      inviterId: SEED_USER_ID,
      organizationId: SEED_ORGANIZATION_ID,
      role: "member",
      status: "pending",
      expiresAt,
    },
    {
      id: crypto.randomUUID(),
      email: "admin.demo@agropilot.dev",
      inviterId: SEED_USER_ID,
      organizationId: SEED_ORGANIZATION_ID,
      role: "admin",
      status: "pending",
      expiresAt,
    },
  ])

  console.log("✓ invitations")

  await db.insert(schema.organizationRoles).values([
    {
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      role: "editor",
      permission: "parcel:create",
    },
    {
      id: crypto.randomUUID(),
      organizationId: SEED_ORGANIZATION_ID,
      role: "editor",
      permission: "parcel:update",
    },
  ])

  console.log("✓ organization_roles")
}
