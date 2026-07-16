import { hc } from "hono/client"
import type { AppType } from "@workspace/api"
import { getClientApiBaseUrl } from "@workspace/web/lib/env"

export const client = hc<AppType>(getClientApiBaseUrl(), {
  init: { credentials: "include" },
  headers: async (): Promise<Record<string, string>> => {
    // Server Components
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      return { Cookie: cookieStore.toString() }
    }
    // Client: credentials auto with "include"
    return {}
  },
})
