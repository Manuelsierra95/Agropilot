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
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  bulkCreateDemoInvitations,
  cancelDemoInvitation,
  createDemoInvitation,
  getDemoActiveOrganization,
  getDemoOrganizationMe,
  getDemoOrganizationMembers,
  listDemoInvitations,
} from "@workspace/web/lib/mockdata"

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
  (): Promise<ActiveOrganizationData> => {
    if (isDemoMode()) return Promise.resolve(getDemoActiveOrganization())
    return client.api.v1.organization.active
      .$get()
      .then(
        (response) =>
          response.json() as unknown as Promise<{ data: ActiveOrganizationData }>
      )
      .then((body) => body.data)
  }
)

const getOrganizationMembers = cache(
  (): Promise<OrganizationMember[]> => {
    if (isDemoMode()) return Promise.resolve(getDemoOrganizationMembers())
    return client.api.v1.organization.members
      .$get()
      .then(
        (response) =>
          response.json() as unknown as Promise<{
            data: { members: OrganizationMember[] }
          }>
      )
      .then((body) => body.data.members)
  }
)

const getOrganizationMe = cache(
  (): Promise<OrganizationMeResponse> => {
    if (isDemoMode()) return Promise.resolve(getDemoOrganizationMe())
    return client.api.v1.organization.me
      .$get()
      .then(
        (response) =>
          response.json() as unknown as Promise<{ data: OrganizationMeResponse }>
      )
      .then((body) => body.data)
  }
)

const updateOrganization = (
  data: UpdateOrganizationInput
): Promise<UpdateOrganizationInput> =>
  client.api.v1.organization.name
    .$put({ json: data })
    .then((r) => r.json() as unknown as Promise<{ data: UpdateOrganizationInput }>)
    .then((body) => body.data)

const listInvitations = async (): Promise<InvitationSelect[]> => {
  if (isDemoMode()) return listDemoInvitations()
  const response = await client.api.v1.organization.invitations.$get()
  const body = await parseApiResponse<{
    data: { invitations: InvitationSelect[] }
  }>(response)
  return body.data.invitations
}

const createInvitation = async (
  data: InvitationCreateInput
): Promise<InvitationSelect> => {
  if (isDemoMode()) return createDemoInvitation(data)
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
  if (isDemoMode()) return bulkCreateDemoInvitations(data)
  const response = await client.api.v1.organization.invitations.bulk.$post({
    json: data,
  })
  const body = await parseApiResponse<{ data: InvitationBulkCreateResult }>(
    response
  )
  return body.data
}

const cancelInvitation = async (id: string): Promise<string> => {
  if (isDemoMode()) return cancelDemoInvitation(id)
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
