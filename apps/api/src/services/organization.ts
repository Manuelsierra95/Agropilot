import { eq, db, schema } from "@workspace/db"
import type {
  ActiveOrganizationData,
  AuthMember,
  AuthOrganization,
  UpdateOrganizationInput,
} from "@workspace/schemas"
import { HTTPException } from "hono/http-exception"

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
): Promise<AuthMember[]> => {
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
