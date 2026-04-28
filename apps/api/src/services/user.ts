import { db, schema, eq } from "@workspace/db"
import type {
  AuthUser,
  MemberContext,
  UserMeResponse,
} from "@workspace/schemas"

export async function getUserMe(
  user: AuthUser,
  member: MemberContext
): Promise<UserMeResponse> {
  const account = await db.query.accounts.findFirst({
    where: eq(schema.accounts.userId, user.id),
    columns: { providerId: true },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: member.role,
    organizationId: member.organizationId,
    provider: account?.providerId ?? "email",
    createdAt: member.createdAt,
  }
}
