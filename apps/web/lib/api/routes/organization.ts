import { client } from "@/lib/api/client"
import type {
  OrganizationMember,
  UpdateOrganizationInput,
  ActiveOrganizationData,
} from "@workspace/schemas"
import { cache } from "react"

const getActiveOrganization = cache(
  (): Promise<ActiveOrganizationData> =>
    client.api.v1.organization.active.$get().then((response) => response.json())
)

const getOrganizationMembers = cache(
  (): Promise<OrganizationMember[]> =>
    client.api.v1.organization.members
      .$get()
      .then((response) => response.json().then((data) => data.members))
)

const updateOrganization = (data: UpdateOrganizationInput) =>
  client.api.v1.organization.name.$put({ json: data }).then((r) => r.json())

export const organizationApi = {
  public: getActiveOrganization,
  members: getOrganizationMembers,
  update: updateOrganization,
}
