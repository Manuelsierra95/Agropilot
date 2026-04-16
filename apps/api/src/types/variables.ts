import type { AuthMember, AuthSession, AuthUser } from "@workspace/schemas"

export type ApiVariables = {
  user: AuthUser | null
  session: AuthSession | null
  organizationId: string | null
  member: AuthMember | null
}
