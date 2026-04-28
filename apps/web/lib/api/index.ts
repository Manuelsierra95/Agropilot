import { exampleApi } from "@/lib/api/routes/example"
import { organizationApi } from "./routes/organization"
import { userApi } from "./routes/user"
import { billingApi } from "./routes/billing"

export const api = {
  example: exampleApi,
  user: userApi,
  organization: organizationApi,
  billing: billingApi,
}
