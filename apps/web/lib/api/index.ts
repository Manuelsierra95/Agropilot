import { authApi } from "@/lib/api/routes/auth"
import { exampleApi } from "@/lib/api/routes/example"

export const api = {
  auth: authApi,
  example: exampleApi,
}
