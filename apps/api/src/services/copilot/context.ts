import type { CopilotContext } from "@workspace/copilot"

import { getOrganizationName } from "@/services/organization"
import { getParcelNameForOrg, resolveParcelIdForOrg } from "@/services/parcel"

export async function resolveCopilotContext(
  organizationId: string,
  userId: string,
  requestedParcelId?: string
): Promise<CopilotContext> {
  const activeParcelId = requestedParcelId
    ? ((await resolveParcelIdForOrg(organizationId, requestedParcelId)) ??
      undefined)
    : undefined

  const [organizationName, activeParcelName] = await Promise.all([
    getOrganizationName(organizationId),
    activeParcelId
      ? getParcelNameForOrg(organizationId, activeParcelId)
      : Promise.resolve(null),
  ])

  return {
    organizationId,
    userId,
    organizationName: organizationName ?? undefined,
    activeParcelId,
    activeParcelName: activeParcelName ?? undefined,
  }
}
