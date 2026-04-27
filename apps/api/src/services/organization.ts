import { eq, db, schema } from "@workspace/db"
import type { ActiveOrganizationData, AuthMember } from "@workspace/schemas"
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
