import type { AuthMember, AuthSession, AuthUser } from "@workspace/schemas"

export type ApiVariables = {
  user: AuthUser | null
  session: AuthSession | null
  organizationId: string | null
  member: AuthMember | null
}

export type AuthVariables = {
  user: AuthUser
  session: AuthSession
  organizationId: string
  member: AuthMember
}
