import { client } from "@/lib/api/client"
import { BillingMeResponse } from "@workspace/schemas"
import { cache } from "react"

const getBillingMe = cache(
  (): Promise<BillingMeResponse> =>
    client.api.v1.billing.me.$get().then((response) => response.json())
)

export const billingApi = {
  getMe: getBillingMe,
}
