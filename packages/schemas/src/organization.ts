import { createSelectSchema } from "drizzle-zod"
import { organizations, members } from "@workspace/db"
import type { AuthSession, AuthUser } from "./auth"

export const organizationSchema = createSelectSchema(organizations)
export const memberSchema = createSelectSchema(members)

export type AuthOrganization = ReturnType<typeof organizationSchema.parse>
export type AuthMember = ReturnType<typeof memberSchema.parse>

export type ActiveOrganizationContext = {
  organizationId: string | null
  organization: AuthOrganization | null
  member: AuthMember | null
}

export type GetActiveOrganizationInput = {
  user: AuthUser
  session: AuthSession
  requestedOrganizationId?: string | null
}

export type GetActiveOrganizationRouteInput = {
  user: AuthUser | null | undefined
  session: AuthSession | null | undefined
  requestedOrganizationId?: string | null
}

export type ActiveOrganizationData = {
  organization: AuthOrganization
  member: AuthMember
}

export const parseAuthOrganization = (
  value: unknown
): AuthOrganization | null => {
  const parsed = organizationSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export const parseAuthMember = (value: unknown): AuthMember | null => {
  const parsed = memberSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}
