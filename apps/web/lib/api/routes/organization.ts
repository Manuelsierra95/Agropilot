import { client } from "@workspace/web/lib/api/client"
import type {
  OrganizationMember,
  UpdateOrganizationInput,
  ActiveOrganizationData,
  OrganizationMeResponse,
  InvitationSelect,
  InvitationCreateInput,
  InvitationBulkCreateInput,
  InvitationBulkCreateResult,
} from "@workspace/schemas"
import { cache } from "react"

const getActiveOrganization = cache(
  (): Promise<ActiveOrganizationData> =>
    client.api.v1.organization.active
      .$get()
      .then((response) => response.json() as Promise<{ data: ActiveOrganizationData }>)
      .then((body) => body.data)
)

const getOrganizationMembers = cache(
  (): Promise<OrganizationMember[]> =>
    client.api.v1.organization.members
      .$get()
      .then((response) => response.json() as Promise<{ data: { members: OrganizationMember[] } }>)
      .then((body) => body.data.members)
)

const getOrganizationMe = cache(
  (): Promise<OrganizationMeResponse> =>
    client.api.v1.organization.me
      .$get()
      .then((response) => response.json() as Promise<{ data: OrganizationMeResponse }>)
      .then((body) => body.data)
)

const updateOrganization = (data: UpdateOrganizationInput) =>
  client.api.v1.organization.name
    .$put({ json: data })
    .then((r) => r.json() as Promise<{ data: UpdateOrganizationInput }>)
    .then((body) => body.data)

const listInvitations = (): Promise<InvitationSelect[]> =>
  client.api.v1.organization.invitations
    .$get()
    .then((response) => response.json() as Promise<{ data: { invitations: InvitationSelect[] } }>)
    .then((body) => body.data.invitations)

const createInvitation = (data: InvitationCreateInput): Promise<InvitationSelect> =>
  client.api.v1.organization.invitations
    .$post({ json: data })
    .then((response) => response.json() as Promise<{ data: { invitation: InvitationSelect } }>)
    .then((body) => body.data.invitation)

const bulkCreateInvitations = (
  data: InvitationBulkCreateInput
): Promise<InvitationBulkCreateResult> =>
  client.api.v1.organization.invitations.bulk
    .$post({ json: data })
    .then((response) => response.json() as Promise<{ data: InvitationBulkCreateResult }>)
    .then((body) => body.data)

const cancelInvitation = (id: string): Promise<string> =>
  client.api.v1.organization.invitations[":id"]
    .$delete({ param: { id } })
    .then((response) => response.json() as Promise<{ data: { id: string } }>)
    .then((body) => body.data.id)

export const organizationApi = {
  getActive: getActiveOrganization,
  getMembers: getOrganizationMembers,
  getMe: getOrganizationMe,
  update: updateOrganization,
  listInvitations,
  createInvitation,
  bulkCreateInvitations,
  cancelInvitation,
}
