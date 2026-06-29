import { createSelectSchema, createUpdateSchema } from "drizzle-zod"
import { organizations, members, invitations } from "@workspace/db/schemas"
import z from "zod"
import { AuthUser } from "../auth/session"

export const invitationRoleSchema = z.enum(["admin", "member", "viewer"])

export const invitationCreateSchema = z.object({
  email: z.string().trim().email(),
  role: invitationRoleSchema,
})

export const invitationBulkCreateSchema = z.object({
  invitations: z.array(invitationCreateSchema).min(1).max(50),
})

export const invitationSelectSchema = createSelectSchema(invitations)

export type InvitationRole = z.infer<typeof invitationRoleSchema>
export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>
export type InvitationBulkCreateInput = z.infer<typeof invitationBulkCreateSchema>

type InvitationSelectFromSchema = ReturnType<
  typeof invitationSelectSchema.parse
>

export type InvitationSelect = InvitationSelectFromSchema

export type InvitationBulkCreateResult = {
  invitations: InvitationSelect[]
  failed: { email: string; message: string }[]
  count: number
}

export const parseInvitationSelect = (
  value: unknown
): InvitationSelect | null => {
  const parsed = invitationSelectSchema.safeParse(value)
  return parsed.success ? (parsed.data as unknown as InvitationSelect) : null
}

export const organizationSchema = createSelectSchema(organizations)
export const memberSchema = createSelectSchema(members)
export const updateOrganizationSchema = createUpdateSchema(organizations, {
  name: (schema) => schema.min(1).max(100).trim(),
})
  .pick({
    name: true,
    logo: true,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })

export type UpdateOrganizationInput = ReturnType<
  typeof updateOrganizationSchema.parse
>
export type AuthOrganization = ReturnType<typeof organizationSchema.parse>
export type AuthMember = ReturnType<typeof memberSchema.parse>

export type OrganizationMemberWithUser = AuthMember & {
  user: Pick<AuthUser, "id" | "name" | "email" | "image">
}

export type ActiveOrganizationContext = {
  organizationId: string | null
  organization: AuthOrganization | null
  member: AuthMember | null
}

export type ActiveOrganizationData = {
  organization: AuthOrganization
  member: AuthMember
}

export type OrganizationMember = Pick<
  AuthMember,
  "id" | "role" | "createdAt"
> & {
  user: Pick<AuthUser, "id" | "name" | "email" | "image">
}

export type OrganizationMemberItem = {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  role: string
  joinedAt: Date
}

export type OrganizationMeResponse = {
  id: string
  name: string
  logo: string | null
  plan: AuthOrganization["plan"]
  status: AuthOrganization["status"]
  createdAt: Date
  viewerRole: string
  viewerUserId: string
  members: OrganizationMemberItem[]
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
