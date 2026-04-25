import { client } from "@/lib/api/client"
import { type ActiveOrganizationData } from "@workspace/schemas"
import { cache } from "react"

const getActiveOrganization = cache(
  (): Promise<ActiveOrganizationData> =>
    client.api.v1.organization.active.$get().then((response) => response.json())
)

export const organizationApi = {
  public: getActiveOrganization,
}
