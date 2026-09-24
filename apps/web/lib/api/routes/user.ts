import { client } from "@workspace/web/lib/api/client"
import type { UserMeResponse } from "@workspace/schemas"
import { cache } from "react"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { getDemoCurrentUser, updateDemoOnboarding } from "@workspace/web/lib/mockdata"

const getUserMe = cache(
  (): Promise<UserMeResponse> => {
    if (isDemoMode()) return Promise.resolve(getDemoCurrentUser())
    return client.api.v1.user.me
      .$get()
      .then((response) => response.json() as unknown as Promise<{ data: UserMeResponse }>)
      .then((body) => body.data)
  }
)

const updateUserOnboarding = async (
  onboardingStep: number
): Promise<UserMeResponse> => {
  if (isDemoMode()) return updateDemoOnboarding(onboardingStep)
  const response = await client.api.v1.user.me.$patch({
    json: { onboardingStep },
  })
  const body = (await response.json()) as unknown as { data: UserMeResponse }
  return body.data
}

export const userApi = {
  getMe: getUserMe,
  updateOnboarding: updateUserOnboarding,
}
