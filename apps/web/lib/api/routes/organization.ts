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

type ApiErrorBody = {
  message?: string
  error?: { message?: string }
}

function getApiErrorMessage(body: ApiErrorBody, status: number): string {
  if (typeof body.error?.message === "string") return body.error.message
  if (typeof body.message === "string") return body.message
  return `API error: ${status}`
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & ApiErrorBody

  if (!response.ok) {
    throw new Error(getApiErrorMessage(body, response.status))
  }

  return body
}

const getActiveOrganization = cache(
  (): Promise<ActiveOrganizationData> =>
    client.api.v1.organization.active
      .$get()
      .then(
        (response) =>
          response.json() as Promise<{ data: ActiveOrganizationData }>
      )
      .then((body) => body.data)
)

const getOrganizationMembers = cache(
  (): Promise<OrganizationMember[]> =>
    client.api.v1.organization.members
      .$get()
      .then(
        (response) =>
          response.json() as Promise<{
            data: { members: OrganizationMember[] }
          }>
      )
      .then((body) => body.data.members)
)

const getOrganizationMe = cache(
  (): Promise<OrganizationMeResponse> =>
    client.api.v1.organization.me
      .$get()
      .then(
        (response) =>
          response.json() as Promise<{ data: OrganizationMeResponse }>
      )
      .then((body) => body.data)
)

const updateOrganization = (data: UpdateOrganizationInput) =>
  client.api.v1.organization.name
    .$put({ json: data })
    .then((r) => r.json() as Promise<{ data: UpdateOrganizationInput }>)
    .then((body) => body.data)

const listInvitations = async (): Promise<InvitationSelect[]> => {
  const response = await client.api.v1.organization.invitations.$get()
  const body = await parseApiResponse<{
    data: { invitations: InvitationSelect[] }
  }>(response)
  return body.data.invitations
}

const createInvitation = async (
  data: InvitationCreateInput
): Promise<InvitationSelect> => {
  const response = await client.api.v1.organization.invitations.$post({
    json: data,
  })
  const body = await parseApiResponse<{
    data: { invitation: InvitationSelect }
  }>(response)
  return body.data.invitation
}

const bulkCreateInvitations = async (
  data: InvitationBulkCreateInput
): Promise<InvitationBulkCreateResult> => {
  const response = await client.api.v1.organization.invitations.bulk.$post({
    json: data,
  })
  const body = await parseApiResponse<{ data: InvitationBulkCreateResult }>(
    response
  )
  return body.data
}

const cancelInvitation = async (id: string): Promise<string> => {
  const response = await client.api.v1.organization.invitations[":id"].$delete({
    param: { id },
  })
  const body = await parseApiResponse<{ data: { id: string } }>(response)
  return body.data.id
}

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
