import { auth } from "@workspace/auth"
import { eq, db, schema } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import {
  parseInvitationSelect,
  type InvitationBulkCreateResult,
  type InvitationCreateInput,
  type InvitationSelect,
} from "@workspace/schemas"

function parseInvitation(value: unknown): InvitationSelect {
  const invitation = parseInvitationSelect(value)
  if (!invitation) {
    throw new HTTPException(500, { message: "Invalid invitation response" })
  }
  return invitation
}

function parseInvitations(value: unknown): InvitationSelect[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const invitation = parseInvitationSelect(item)
    return invitation ? [invitation] : []
  })
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Failed to process invitation"
}

async function createInvitationInternal(
  organizationId: string,
  input: InvitationCreateInput,
  headers: Headers
): Promise<
  | { success: true; invitation: InvitationSelect }
  | { success: false; message: string }
> {
  try {
    const data = await auth.api.createInvitation({
      body: {
        email: input.email,
        role: input.role,
        organizationId,
        resend: true,
      },
      headers,
    })
    return { success: true, invitation: parseInvitation(data) }
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

export async function createInvitation(
  organizationId: string,
  input: InvitationCreateInput,
  headers: Headers
): Promise<InvitationSelect> {
  const result = await createInvitationInternal(organizationId, input, headers)
  if (!result.success) {
    throw new HTTPException(400, { message: result.message })
  }
  return result.invitation
}

export async function bulkCreateInvitations(
  organizationId: string,
  items: InvitationCreateInput[],
  headers: Headers
): Promise<InvitationBulkCreateResult> {
  const invitations: InvitationSelect[] = []
  const failed: { email: string; message: string }[] = []

  for (const item of items) {
    const result = await createInvitationInternal(organizationId, item, headers)
    if (result.success) {
      invitations.push(result.invitation)
    } else {
      failed.push({ email: item.email, message: result.message })
    }
  }

  if (invitations.length === 0) {
    throw new HTTPException(400, {
      message: failed[0]?.message ?? "No invitations could be created",
    })
  }

  return {
    invitations,
    failed,
    count: invitations.length,
  }
}

export async function listInvitations(
  organizationId: string,
  headers: Headers
): Promise<InvitationSelect[]> {
  try {
    const data = await auth.api.listInvitations({
      query: { organizationId },
      headers,
    })
    return parseInvitations(data)
  } catch (error) {
    throw new HTTPException(400, { message: getErrorMessage(error) })
  }
}

const CANCELED_STATUSES = new Set(["canceled", "cancelled"])

export async function cancelInvitation(
  invitationId: string,
  organizationId: string,
  _headers: Headers
): Promise<void> {
  const invitation = await db.query.invitations.findFirst({
    where: eq(schema.invitations.id, invitationId),
    columns: { id: true, status: true, organizationId: true },
  })

  if (!invitation || invitation.organizationId !== organizationId) {
    throw new HTTPException(404, { message: "Invitation not found" })
  }

  if (CANCELED_STATUSES.has(invitation.status)) {
    return
  }

  if (invitation.status === "accepted") {
    throw new HTTPException(400, {
      message: "No se puede cancelar una invitación ya aceptada",
    })
  }

  if (invitation.status !== "pending") {
    throw new HTTPException(400, {
      message: `No se puede cancelar una invitación con estado "${invitation.status}"`,
    })
  }

  await db
    .update(schema.invitations)
    .set({ status: "canceled" })
    .where(eq(schema.invitations.id, invitationId))
}
