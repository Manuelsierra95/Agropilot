import { eq, db, schema } from "@workspace/db"
import type {
  AuthOrganization,
  UpdateOrganizationInput,
} from "@workspace/schemas"
import { HTTPException } from "hono/http-exception"

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
