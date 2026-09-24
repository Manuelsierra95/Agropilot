import { client } from "@workspace/web/lib/api/client"
import type { BillingMeResponse } from "@workspace/schemas"
import { cache } from "react"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { getDemoBillingMe } from "@workspace/web/lib/mockdata"

const getBillingMe = cache(
  (): Promise<BillingMeResponse> => {
    if (isDemoMode()) return Promise.resolve(getDemoBillingMe())
    return client.api.v1.billing.me
      .$get()
      .then(
        (response) => response.json() as unknown as Promise<{ data: BillingMeResponse }>
      )
      .then((body) => body.data)
  }
)

export const billingApi = {
  getMe: getBillingMe,
}
