import { members } from "@workspace/db/schemas"
import { createSelectSchema } from "drizzle-zod"

export const memberSelectSchema = createSelectSchema(members)

export type MemberSelect = ReturnType<typeof memberSelectSchema.parse>
export type MemberContext = Pick<
  MemberSelect,
  "role" | "organizationId" | "createdAt"
>

export type OrganizationRole = NonNullable<
  (typeof members.$inferSelect)["role"]
>
