import {
  accounts,
  members,
  sessions,
  users,
  verifications,
} from "@workspace/db"
import type { AuthMember } from "./organization"
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

const authUserFields = { id: true, email: true } as const
const authSessionFields = {
  id: true,
  userId: true,
  activeOrganizationId: true,
} as const

export const authUserSchema = userSelectSchema.pick(authUserFields)
export const authSessionSchema = sessionSelectSchema.pick(authSessionFields)

export type AuthUser = ReturnType<typeof authUserSchema.parse>
export type AuthSession = ReturnType<typeof authSessionSchema.parse>
export type OrganizationRole = NonNullable<
  (typeof members.$inferSelect)["role"]
>

export type AuthContext = {
  user: AuthUser
  session: AuthSession
  organizationId: string | null
  member: AuthMember | null
}

export type UserSelect = ReturnType<typeof userSelectSchema.parse>
export type UserInsert = ReturnType<typeof userInsertSchema.parse>
export type UserUpdate = ReturnType<typeof userUpdateSchema.parse>

export type SessionSelect = ReturnType<typeof sessionSelectSchema.parse>
export type SessionInsert = ReturnType<typeof sessionInsertSchema.parse>
export type SessionUpdate = ReturnType<typeof sessionUpdateSchema.parse>

export type AccountSelect = ReturnType<typeof accountSelectSchema.parse>
export type AccountInsert = ReturnType<typeof accountInsertSchema.parse>
export type AccountUpdate = ReturnType<typeof accountUpdateSchema.parse>

export type VerificationSelect = ReturnType<
  typeof verificationSelectSchema.parse
>
export type VerificationInsert = ReturnType<
  typeof verificationInsertSchema.parse
>
export type VerificationUpdate = ReturnType<
  typeof verificationUpdateSchema.parse
>

export const parseAuthUser = (value: unknown): AuthUser | null => {
  const parsed = authUserSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export const parseAuthSession = (value: unknown): AuthSession | null => {
  const parsed = authSessionSchema.safeParse(value)
  return parsed.success ? parsed.data : null
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
