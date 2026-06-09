import { exampleApi } from "@/lib/api/routes/example"
import { organizationApi } from "./routes/organization"
import { userApi } from "./routes/user"
import { billingApi } from "./routes/billing"
import { searchApi } from "./routes/search"
import { financeApi } from "./routes/finance"
import { copilotApi } from "./routes/copilot"

export const api = {
  example: exampleApi,
  user: userApi,
  organization: organizationApi,
  billing: billingApi,
  search: searchApi,
  finance: financeApi,
  copilot: copilotApi,
}
