import { client } from "@/lib/api/client"
import { type ActiveOrganizationData } from "@workspace/schemas"

export const organizationApi = {
  public: async (): Promise<ActiveOrganizationData> => {
    return await client.api.v1.organization.active
      .$get()
      .then((response) => response.json())
  },
}
