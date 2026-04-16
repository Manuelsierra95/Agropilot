import type { AuthSession, AuthUser, TeamRole } from "@workspace/schemas"

export type ApiVariables = {
  user: AuthUser | null
  session: AuthSession | null
  team: {
    id: string
    role: TeamRole
  } | null
}
