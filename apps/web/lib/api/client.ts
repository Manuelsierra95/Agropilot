import { hc } from "hono/client"
import type { AppType } from "@workspace/api"
import { getClientApiBaseUrl } from "@workspace/web/lib/env"
import { isDemoMode } from "@workspace/web/lib/demo-mode"

function buildRealClient() {
  return hc<AppType>(getClientApiBaseUrl(), {
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
}

export const client = isDemoMode()
  ? (new Proxy({} as ReturnType<typeof buildRealClient>, {
      get() {
        return () => {
          throw new Error(
            "[demo-mode] Hono client was called. Each api route must short-circuit to lib/mockdata.ts before using the client."
          )
        }
      },
    }) as ReturnType<typeof buildRealClient>)
  : buildRealClient()
