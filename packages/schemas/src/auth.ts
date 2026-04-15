import { schema } from "@workspace/db"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"

export const userSelectSchema = createSelectSchema(schema.users)
export const userInsertSchema = createInsertSchema(schema.users)
export const userUpdateSchema = createUpdateSchema(schema.users)

export const sessionSelectSchema = createSelectSchema(schema.sessions)
export const sessionInsertSchema = createInsertSchema(schema.sessions)
export const sessionUpdateSchema = createUpdateSchema(schema.sessions)

export const accountSelectSchema = createSelectSchema(schema.accounts)
export const accountInsertSchema = createInsertSchema(schema.accounts)
export const accountUpdateSchema = createUpdateSchema(schema.accounts)

export const verificationSelectSchema = createSelectSchema(schema.verifications)
export const verificationInsertSchema = createInsertSchema(schema.verifications)
export const verificationUpdateSchema = createUpdateSchema(schema.verifications)

const authUserBaseSchema = userSelectSchema.pick({
  id: true,
  email: true,
  activeTeamId: true,
})

export const authUserSchema = authUserBaseSchema

export type AuthUser = {
  id: string
  email: string
  activeTeamId: string | null
}
export type TeamRole = "owner" | "admin" | "editor" | "viewer"

export const authSessionSchema = sessionSelectSchema.pick({
  id: true,
  userId: true,
})

export type AuthSession = {
  id: string
  userId: string
}

export type AuthContext = {
  user: AuthUser
  session: AuthSession
  team: {
    id: string
    role: TeamRole
  } | null
}

export const parseAuthUser = (value: unknown): AuthUser | null => {
  const parsed = authUserSchema.safeParse(value)
  return parsed.success ? (parsed.data as AuthUser) : null
}

export const parseAuthSession = (value: unknown): AuthSession | null => {
  const parsed = authSessionSchema.safeParse(value)
  return parsed.success ? (parsed.data as AuthSession) : null
}

export const buildAuthContext = (
  user: AuthUser,
  session: AuthSession,
  team?: { id: string; role: TeamRole } | null
): AuthContext => ({
  user,
  session,
  team: team ?? null,
})

export type UserSelect = typeof userSelectSchema.type
export type UserInsert = typeof userInsertSchema.type
export type UserUpdate = typeof userUpdateSchema.type

export type SessionSelect = typeof sessionSelectSchema.type
export type SessionInsert = typeof sessionInsertSchema.type
export type SessionUpdate = typeof sessionUpdateSchema.type

export type AccountSelect = typeof accountSelectSchema.type
export type AccountInsert = typeof accountInsertSchema.type
export type AccountUpdate = typeof accountUpdateSchema.type

export type VerificationSelect = typeof verificationSelectSchema.type
export type VerificationInsert = typeof verificationInsertSchema.type
export type VerificationUpdate = typeof verificationUpdateSchema.type
