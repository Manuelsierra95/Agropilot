import { and, eq } from "drizzle-orm"

import { db, schema } from "@workspace/db"
import type { AuthSession, AuthUser } from "@workspace/schemas"

type ResolveOrganizationContextInput = {
  user: AuthUser
  session: AuthSession
  requestedOrganizationId?: string | null
}

type OrganizationContext = {
  organizationId: string | null
  member: typeof schema.members.$inferSelect | null
}

export const resolveOrganizationContext = async ({
  user,
  session,
  requestedOrganizationId,
}: ResolveOrganizationContextInput): Promise<OrganizationContext> => {
  const organizationId = requestedOrganizationId || session.activeOrganizationId

  if (!organizationId) {
    const fallbackMember = await db.query.members.findFirst({
      where: eq(schema.members.userId, user.id),
    })

    if (!fallbackMember) {
      return { organizationId: null, member: null }
    }

    return {
      organizationId: fallbackMember.organizationId,
      member: fallbackMember,
    }
  }

  const member = await db.query.members.findFirst({
    where: and(
      eq(schema.members.userId, user.id),
      eq(schema.members.organizationId, organizationId)
    ),
  })

  if (!member) {
    return { organizationId: null, member: null }
  }

  return {
    organizationId,
    member,
  }
}
