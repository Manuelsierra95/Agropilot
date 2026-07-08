import type { InvitationRole } from "@workspace/schemas"

export type { InvitationRole }

export type InviteDraft = {
  id: string
  email: string
  role: InvitationRole
}

export const INVITATION_ROLE_LABELS: Record<InvitationRole, string> = {
  admin: "Administrador",
  member: "Miembro",
  viewer: "Solo lectura",
}

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  editor: "Editor",
  member: "Miembro",
  viewer: "Solo lectura",
}

export const DEFAULT_INVITATION_ROLE: InvitationRole = "member"

export function createInviteDraftId() {
  return `invite-${crypto.randomUUID()}`
}
