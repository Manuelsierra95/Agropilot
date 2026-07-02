import { client } from "@workspace/web/lib/api/client"
import type { BillingMeResponse } from "@workspace/schemas"
import { cache } from "react"

const getBillingMe = cache(
  (): Promise<BillingMeResponse> =>
    client.api.v1.billing.me
      .$get()
      .then(
        (response) => response.json() as Promise<{ data: BillingMeResponse }>
      )
      .then((body) => body.data)
)

export const billingApi = {
  getMe: getBillingMe,
}
