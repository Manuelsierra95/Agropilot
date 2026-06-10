import { exampleApi } from "@/lib/api/routes/example"
import { organizationApi } from "./routes/organization"
import { userApi } from "./routes/user"
import { billingApi } from "./routes/billing"
import { searchApi } from "./routes/search"
import { financeApi } from "./routes/finance"
import { copilotApi } from "./routes/copilot"
import { dashboardApi } from "./routes/dashboard"
import { parcelApi } from "./routes/parcel"
import { campaignApi } from "./routes/campaign"

export const api = {
  example: exampleApi,
  user: userApi,
  organization: organizationApi,
  billing: billingApi,
  search: searchApi,
  finance: financeApi,
  copilot: copilotApi,
  dashboard: dashboardApi,
  parcel: parcelApi,
  campaign: campaignApi,
}
