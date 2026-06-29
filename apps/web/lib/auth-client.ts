import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { versionedApiUrl } from "@workspace/web/lib/env"

export const authClient = createAuthClient(
  {
    baseURL: `${versionedApiUrl}/auth`,
    plugins: [
      organizationClient({
        dynamicAccessControl: {
          enabled: true,
        },
      }),
    ],
  }
)

export const { signIn, signOut, signUp, useSession } = authClient
