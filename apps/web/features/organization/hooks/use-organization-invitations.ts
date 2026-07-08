"use client"

import { useQuery } from "@tanstack/react-query"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"

export function useOrganizationInvitations(
  organizationId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ["organization", organizationId, "invitations"],
    queryFn: () => organizationApi.listInvitations(),
    enabled: enabled && Boolean(organizationId),
  })
}
