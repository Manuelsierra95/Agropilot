import { and, eq } from "drizzle-orm"

import { db, schema } from "@workspace/db"
import { TEAM_ROLE_HIERARCHY, type TeamRole } from "@workspace/schemas"

export const isRoleAtLeast = (role: TeamRole, minRole: TeamRole) =>
  TEAM_ROLE_HIERARCHY[role] >= TEAM_ROLE_HIERARCHY[minRole]

export const canInviteUsers = (role: TeamRole) =>
  role === "owner" || role === "admin"

export const canEditParcels = (role: TeamRole) => isRoleAtLeast(role, "editor")

export const canManageAdmins = (role: TeamRole) => role === "owner"

export async function switchActiveTeam(userId: string, teamId: string) {
  const membership = await db.query.memberships.findFirst({
    where: and(
      eq(schema.memberships.userId, userId),
      eq(schema.memberships.teamId, teamId)
    ),
  })

  if (!membership) {
    throw new Error("FORBIDDEN_TEAM")
  }

  await db
    .update(schema.users)
    .set({ activeTeamId: teamId })
    .where(eq(schema.users.id, userId))

  return {
    activeTeamId: teamId,
    role: membership.role,
  }
}

export async function createTeam(userId: string, name: string) {
  const teamId = crypto.randomUUID()

  const [team] = await db
    .insert(schema.teams)
    .values({
      id: teamId,
      name,
      isPersonal: false,
    })
    .returning()

  await db.insert(schema.memberships).values({
    id: crypto.randomUUID(),
    userId,
    teamId,
    role: "owner",
  })

  return team
}

export async function createPersonalTeam(userId: string, name = "Mi equipo") {
  const teamId = crypto.randomUUID()

  const [team] = await db
    .insert(schema.teams)
    .values({
      id: teamId,
      name,
      isPersonal: true,
    })
    .returning()

  await db.insert(schema.memberships).values({
    id: crypto.randomUUID(),
    userId,
    teamId,
    role: "owner",
  })

  await db
    .update(schema.users)
    .set({ activeTeamId: teamId })
    .where(eq(schema.users.id, userId))

  return team
}

export async function removeMembership(
  actorId: string,
  targetMembershipId: string
) {
  const target = await db.query.memberships.findFirst({
    where: eq(schema.memberships.id, targetMembershipId),
  })

  if (!target) {
    throw new Error("Membership objetivo no encontrada.")
  }

  if (target.role === "owner") {
    throw new Error(
      "No se puede eliminar la membership del owner. Transfiere el ownership primero."
    )
  }

  const actorMembership = await db.query.memberships.findFirst({
    where: and(
      eq(schema.memberships.teamId, target.teamId),
      eq(schema.memberships.userId, actorId)
    ),
  })

  if (!actorMembership || !canInviteUsers(actorMembership.role)) {
    throw new Error("No tienes permisos para expulsar miembros.")
  }

  if (actorMembership.role === "admin" && target.role === "admin") {
    throw new Error("Solo el owner puede gestionar admins.")
  }

  await db
    .delete(schema.memberships)
    .where(eq(schema.memberships.id, targetMembershipId))
}

export async function transferOwnership(
  teamId: string,
  fromUserId: string,
  toUserId: string
) {
  const [fromMembership, toMembership] = await Promise.all([
    db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.teamId, teamId),
        eq(schema.memberships.userId, fromUserId)
      ),
    }),
    db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.teamId, teamId),
        eq(schema.memberships.userId, toUserId)
      ),
    }),
  ])

  if (!fromMembership || fromMembership.role !== "owner") {
    throw new Error("Solo el owner actual puede transferir ownership.")
  }

  if (!toMembership) {
    throw new Error("El usuario destino debe ser miembro del equipo.")
  }

  await db.transaction(async (tx) => {
    await tx
      .update(schema.memberships)
      .set({ role: "admin" })
      .where(
        and(
          eq(schema.memberships.teamId, teamId),
          eq(schema.memberships.userId, fromUserId)
        )
      )

    await tx
      .update(schema.memberships)
      .set({ role: "owner" })
      .where(
        and(
          eq(schema.memberships.teamId, teamId),
          eq(schema.memberships.userId, toUserId)
        )
      )
  })
}
