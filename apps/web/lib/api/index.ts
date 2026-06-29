import { exampleApi } from "@workspace/web/lib/api/routes/example"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"
import { userApi } from "@workspace/web/lib/api/routes/user"
import { billingApi } from "@workspace/web/lib/api/routes/billing"
import { searchApi } from "@workspace/web/lib/api/routes/search"
import { financeApi } from "@workspace/web/lib/api/routes/finance"
import { copilotApi } from "@workspace/web/lib/api/routes/copilot"
import { parcelApi } from "@workspace/web/lib/api/routes/parcel"
import { campaignApi } from "@workspace/web/lib/api/routes/campaign"
import { tasksApi } from "@workspace/web/lib/api/routes/tasks"
import { weatherApi } from "@workspace/web/lib/api/routes/weather"

export const api = {
  example: exampleApi,
  user: userApi,
  organization: organizationApi,
  billing: billingApi,
  search: searchApi,
  finance: financeApi,
  copilot: copilotApi,
  parcel: parcelApi,
  campaign: campaignApi,
  tasks: tasksApi,
  weather: weatherApi,
}
