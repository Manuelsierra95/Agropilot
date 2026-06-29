import type { CopilotContext } from "@workspace/copilot"

import { getOrganizationName } from "@/services/auth"
import { getParcelNameForOrg } from "@/services/parcels"

export async function resolveCopilotContext(
  organizationId: string,
  userId: string,
  requestedParcelId?: string
): Promise<CopilotContext> {
  const activeParcelName = requestedParcelId
    ? await getParcelNameForOrg(organizationId, requestedParcelId)
    : null

  const organizationName = await getOrganizationName(organizationId)

  return {
    organizationId,
    userId,
    organizationName: organizationName ?? undefined,
    activeParcelId: requestedParcelId,
    activeParcelName: activeParcelName ?? undefined,
  }
}
