import { eq, db, schema } from "@workspace/db"
import type {
  ActiveOrganizationData,
  AuthMember,
  AuthOrganization,
  AuthUser,
  UpdateOrganizationInput,
  OrganizationMeResponse,
  OrganizationMemberWithUser,
} from "@workspace/schemas"
import { HTTPException } from "hono/http-exception"

export async function getOrganizationName(
  organizationId: string
): Promise<string | null> {
  const organization = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, organizationId),
    columns: { name: true },
  })

  return organization?.name ?? null
}

export const getActiveOrganization = async (
  organizationId: string,
  member: AuthMember
): Promise<ActiveOrganizationData> => {
  const organization = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, organizationId),
  })

  if (!organization)
    throw new HTTPException(404, { message: "Organization not found" })

  return { organization, member }
}

export const updateOrganization = async (
  organizationId: string,
  data: UpdateOrganizationInput
): Promise<AuthOrganization> => {
  const [updated] = await db
    .update(schema.organizations)
    .set(data)
    .where(eq(schema.organizations.id, organizationId))
    .returning()

  if (!updated) {
    throw new HTTPException(404, { message: "Organization not found" })
  }

  return updated
}

export const getOrganizationMembers = async (
  organizationId: string
): Promise<OrganizationMemberWithUser[]> => {
  const members = await db.query.members.findMany({
    where: eq(schema.members.organizationId, organizationId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  return members
}

export async function getOrganizationMe(
  user: AuthUser,
  member: AuthMember
): Promise<OrganizationMeResponse> {
  const [{ organization }, members] = await Promise.all([
    getActiveOrganization(member.organizationId, member),
    getOrganizationMembers(member.organizationId),
  ])

  return {
    id: organization.id,
    name: organization.name,
    logo: organization.logo,
    plan: organization.plan,
    status: organization.status,
    createdAt: organization.createdAt,
    viewerRole: member.role,
    viewerUserId: user.id,
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      joinedAt: m.createdAt,
    })),
  }
}
