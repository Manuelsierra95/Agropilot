import { client } from "@/lib/api/client"
import { UserMeResponse } from "@workspace/schemas"
import { cache } from "react"

const getUserMe = cache(
  (): Promise<UserMeResponse> =>
    client.api.v1.user.me.$get().then((response) => response.json())
)

const updateUserOnboarding = (
  onboardingStep: number
): Promise<UserMeResponse> =>
  client.api.v1.user.me
    .$patch({
      json: { onboardingStep },
    })
    .then((response) => response.json())

export const userApi = {
  getMe: getUserMe,
  updateOnboarding: updateUserOnboarding,
}
