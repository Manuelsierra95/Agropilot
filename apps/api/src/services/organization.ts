import { eq } from "drizzle-orm"

import { db, schema } from "@workspace/db"
import {
  memberSchema,
  organizationSchema,
  type ActiveOrganizationContext,
  type GetActiveOrganizationRouteInput,
  type GetActiveOrganizationInput,
  type ActiveOrganizationData,
} from "@workspace/schemas"
import { resolveOrganizationContext } from "@/utils/organization-context"

export const getActiveOrganizationContext = async ({
  user,
  session,
  requestedOrganizationId,
}: GetActiveOrganizationInput): Promise<ActiveOrganizationContext> => {
  const organizationContext = await resolveOrganizationContext({
    user,
    session,
    requestedOrganizationId,
  })

  if (!organizationContext.organizationId || !organizationContext.member) {
    return {
      organizationId: null,
      organization: null,
      member: null,
    }
  }

  const organization = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, organizationContext.organizationId),
  })

  const parsedOrganization = organizationSchema.safeParse(organization)
  const parsedMember = memberSchema.safeParse(organizationContext.member)

  if (!parsedOrganization.success || !parsedMember.success) {
    return {
      organizationId: null,
      organization: null,
      member: null,
    }
  }

  return {
    organizationId: parsedOrganization.data.id,
    organization: parsedOrganization.data,
    member: parsedMember.data,
  }
}

export const getActiveOrganization = async ({
  user,
  session,
  requestedOrganizationId,
}: GetActiveOrganizationRouteInput): Promise<ActiveOrganizationData> => {
  if (!user || !session) throw new Error("User and session are required")

  const activeOrganization = await getActiveOrganizationContext({
    user,
    session,
    requestedOrganizationId,
  })

  if (!activeOrganization.organization || !activeOrganization.member) {
    throw new Error("Organization or member not found")
  }

  return {
    organization: activeOrganization.organization,
    member: activeOrganization.member,
  }
}
