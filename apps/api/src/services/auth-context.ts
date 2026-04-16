import { and, asc, eq } from "drizzle-orm"
import { db, schema } from "@workspace/db"
import type { AuthUser, TeamRole } from "@workspace/schemas"

type TeamContext = {
  id: string
  role: TeamRole
}

type ResolveTeamContextInput = {
  user: AuthUser
  requestedTeamId?: string | null
}

const mapMembershipToTeamContext = (
  membership: typeof schema.memberships.$inferSelect
): TeamContext => ({
  id: membership.teamId,
  role: membership.role,
})

export const resolveTeamContext = async ({
  user,
  requestedTeamId,
}: ResolveTeamContextInput): Promise<TeamContext | null> => {
  if (requestedTeamId) {
    const membership = await db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.userId, user.id),
        eq(schema.memberships.teamId, requestedTeamId)
      ),
    })

    return membership ? mapMembershipToTeamContext(membership) : null
  }

  if (user.activeTeamId) {
    const activeMembership = await db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.userId, user.id),
        eq(schema.memberships.teamId, user.activeTeamId)
      ),
    })

    if (activeMembership) {
      return mapMembershipToTeamContext(activeMembership)
    }
  }

  const fallbackMembership = await db.query.memberships.findFirst({
    where: eq(schema.memberships.userId, user.id),
    orderBy: [asc(schema.memberships.createdAt)],
  })

  return fallbackMembership
    ? mapMembershipToTeamContext(fallbackMembership)
    : null
}
