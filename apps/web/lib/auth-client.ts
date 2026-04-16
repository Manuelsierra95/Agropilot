import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { versionedApiUrl } from "@/lib/env"

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: `${versionedApiUrl}/auth`,
    plugins: [
      organizationClient({
        dynamicAccessControl: {
          enabled: true,
        },
        teams: {
          enabled: true,
        },
      }),
    ],
  }
)

export const { signIn, signOut, signUp, useSession } = authClient
