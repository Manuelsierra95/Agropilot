import { client } from "@/lib/api/client"
import { parseResponse } from "@/lib/api/types"
import { UserMeResponse } from "@workspace/schemas"
import { cache } from "react"

const getUserMe = cache(
  (): Promise<UserMeResponse> =>
    client.api.v1.user.me.$get().then((response) => response.json())
)

const updateUserOnboarding = async (
  onboardingStep: number
): Promise<UserMeResponse> => {
  const response = await client.api.v1.user.me.$patch({
    json: { onboardingStep },
  })
  return parseResponse<UserMeResponse>(response)
}

export const userApi = {
  getMe: getUserMe,
  updateOnboarding: updateUserOnboarding,
}
