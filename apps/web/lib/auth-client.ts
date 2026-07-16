import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { getAuthClientBaseUrl } from "@workspace/web/lib/env"

export const authClient: any = createAuthClient({
  baseURL: getAuthClientBaseUrl(),
  plugins: [
    organizationClient({
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
})

export const { signIn, signOut, signUp, useSession } = authClient
