import { client } from "@workspace/web/lib/api/client"
import type { UserMeResponse } from "@workspace/schemas"
import { cache } from "react"

const getUserMe = cache(
  (): Promise<UserMeResponse> =>
    client.api.v1.user.me
      .$get()
      .then((response) => response.json() as Promise<{ data: UserMeResponse }>)
      .then((body) => body.data)
)

const updateUserOnboarding = async (
  onboardingStep: number
): Promise<UserMeResponse> => {
  const response = await client.api.v1.user.me.$patch({
    json: { onboardingStep },
  })
  const body = await response.json() as { data: UserMeResponse }
  return body.data
}

export const userApi = {
  getMe: getUserMe,
  updateOnboarding: updateUserOnboarding,
}
