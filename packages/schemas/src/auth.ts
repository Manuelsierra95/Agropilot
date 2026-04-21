import {
  accounts,
  members,
  sessions,
  users,
  verifications,
} from "@workspace/db"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"

export const userSelectSchema = createSelectSchema(users)
export const userInsertSchema = createInsertSchema(users)
export const userUpdateSchema = createUpdateSchema(users)

export const sessionSelectSchema = createSelectSchema(sessions)
export const sessionInsertSchema = createInsertSchema(sessions)
export const sessionUpdateSchema = createUpdateSchema(sessions)

export const accountSelectSchema = createSelectSchema(accounts)
export const accountInsertSchema = createInsertSchema(accounts)
export const accountUpdateSchema = createUpdateSchema(accounts)

export const verificationSelectSchema = createSelectSchema(verifications)
export const verificationInsertSchema = createInsertSchema(verifications)
export const verificationUpdateSchema = createUpdateSchema(verifications)

const authUserBaseSchema = userSelectSchema.pick({
  id: true,
  email: true,
})

export const authUserSchema = authUserBaseSchema

export type AuthUser = {
  id: string
  email: string
}
export type OrganizationRole =
  | "owner"
  | "admin"
  | "editor"
  | "member"
  | "viewer"

export const authSessionSchema = sessionSelectSchema.pick({
  id: true,
  userId: true,
  activeOrganizationId: true,
})

export type AuthSession = {
  id: string
  userId: string
  activeOrganizationId: string | null
}

export const authMemberSchema = createSelectSchema(members).pick({
  id: true,
  userId: true,
  organizationId: true,
  role: true,
})

export type AuthMember = {
  id: string
  userId: string
  organizationId: string
  role: string
}

export type AuthContext = {
  user: AuthUser
  session: AuthSession
  organizationId: string | null
  member: AuthMember | null
}

export const parseAuthUser = (value: unknown): AuthUser | null => {
  const parsed = authUserSchema.safeParse(value)
  return parsed.success ? (parsed.data as AuthUser) : null
}

export const parseAuthSession = (value: unknown): AuthSession | null => {
  const parsed = authSessionSchema.safeParse(value)
  return parsed.success ? (parsed.data as AuthSession) : null
}

export const parseAuthMember = (value: unknown): AuthMember | null => {
  const parsed = authMemberSchema.safeParse(value)
  return parsed.success ? (parsed.data as AuthMember) : null
}

export const buildAuthContext = (
  user: AuthUser,
  session: AuthSession,
  member?: AuthMember | null
): AuthContext => ({
  user,
  session,
  organizationId: session.activeOrganizationId,
  member: member ?? null,
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
