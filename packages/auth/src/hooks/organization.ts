import type { User } from "better-auth"
import { and, eq, db, sessions, members, schema } from "@workspace/db"

function buildSlug(user: User): string {
  const base = user.name ?? user.email?.split("@")[0]
  if (!base) {
    throw new Error(
      `User ${user.id} has neither name nor email to build a slug`
    )
  }
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function createOrganizationForUser(user: User): Promise<void> {
  const baseSlug = buildSlug(user)
  const slug = `${baseSlug}-${user.id.slice(0, 8)}`
  const name = user.name || user.email?.split("@")[0] || "My Organization"
  const orgId = crypto.randomUUID()

  await db.insert(schema.organizations).values({
    id: orgId,
    name,
    slug,
    createdAt: new Date(),
  })

  await db.insert(schema.members).values({
    id: crypto.randomUUID(),
    userId: user.id,
    organizationId: orgId,
    role: "owner",
    createdAt: new Date(),
  })

  await db
    .update(sessions)
    .set({ activeOrganizationId: orgId })
    .where(eq(sessions.userId, user.id))
}

export async function setActiveOrgOnSession(session: {
  userId: string
  id: string
}): Promise<void> {
  const membership = await db
    .select({ organizationId: members.organizationId })
    .from(members)
    .where(and(eq(members.userId, session.userId), eq(members.role, "owner")))
    .limit(1)

  const organizationId = membership[0]?.organizationId
  if (!organizationId) return

  await db
    .update(sessions)
    .set({ activeOrganizationId: organizationId })
    .where(eq(sessions.id, session.id))
}
