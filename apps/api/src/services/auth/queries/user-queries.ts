import { db, schema, eq } from "@workspace/db"
import type {
  AuthUser,
  MemberContext,
  UserMeResponse,
  UserOnboardingUpdate,
} from "@workspace/schemas"
import { HTTPException } from "hono/http-exception"

export async function getUserMe(
  user: AuthUser,
  member: MemberContext
): Promise<UserMeResponse> {
  const account = await db.query.accounts.findFirst({
    where: eq(schema.accounts.userId, user.id),
    columns: { providerId: true },
  })

  const userData = await db.query.users.findFirst({
    where: eq(schema.users.id, user.id),
    columns: {
      onboardingStatus: true,
      onboardingStep: true,
    },
  })

  if (!userData) {
    throw new HTTPException(404, { message: "User not found" })
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: member.role,
    organizationId: member.organizationId,
    provider: account?.providerId ?? "email",
    onboardingStatus: userData.onboardingStatus,
    onboardingStep: userData.onboardingStep,
    createdAt: member.createdAt,
  }
}

const ONBOARDING_TOTAL_STEPS = 4

export async function updateUserOnboarding(
  userId: string,
  step: UserOnboardingUpdate["onboardingStep"]
) {
  const status =
    step === 0
      ? "in_progress"
      : step === ONBOARDING_TOTAL_STEPS
        ? "completed"
        : "in_progress"

  const [updated] = await db
    .update(schema.users)
    .set({ onboardingStep: step, onboardingStatus: status })
    .where(eq(schema.users.id, userId))
    .returning({
      onboardingStatus: schema.users.onboardingStatus,
      onboardingStep: schema.users.onboardingStep,
    })

  if (!updated) throw new HTTPException(404, { message: "User not found" })

  return updated
}
