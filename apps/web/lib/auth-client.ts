import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { getVersionedApiPath } from "@workspace/web/lib/env"

export const authClient: any = createAuthClient({
  baseURL: `${getVersionedApiPath()}/auth`,
  plugins: [
    organizationClient({
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
})

export const { signIn, signOut, signUp, useSession } = authClient
