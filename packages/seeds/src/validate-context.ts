import { and, db, eq, schema } from "@workspace/db"

import { SEED_ORGANIZATION_ID, SEED_USER_ID } from "./config"
import { SeedError } from "./errors"

export async function validateContext() {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, SEED_USER_ID),
  })

  if (!user) {
    throw new SeedError("USER_NOT_FOUND")
  }

  const organization = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, SEED_ORGANIZATION_ID),
  })

  if (!organization) {
    throw new SeedError("ORGANIZATION_NOT_FOUND")
  }

  const member = await db.query.members.findFirst({
    where: and(
      eq(schema.members.userId, SEED_USER_ID),
      eq(schema.members.organizationId, SEED_ORGANIZATION_ID)
    ),
  })

  if (!member) {
    throw new SeedError("MEMBERSHIP_NOT_FOUND")
  }

  return { user, organization, member }
}
