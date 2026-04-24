import { exampleApi } from "@/lib/api/routes/example"
import { organizationApi } from "./routes/organization"

export const api = {
  example: exampleApi,
  organization: organizationApi,
}
