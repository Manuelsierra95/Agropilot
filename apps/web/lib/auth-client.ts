import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { getAuthClientBaseUrl } from "@workspace/web/lib/env"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { DEMO_IDS, DEMO_USER } from "@workspace/web/lib/mockdata"

const DEMO_SESSION = {
  user: DEMO_USER as any,
  session: {
    id: "session-demo",
    userId: DEMO_IDS.userId,
    activeOrganizationId: DEMO_IDS.organizationId,
  },
  organizations: [
    {
      id: DEMO_IDS.organizationId,
      name: "Olivares Sierra Mágina",
      logo: null,
      createdAt: new Date(),
    },
  ],
}

function createDemoAuthClient() {
  return {
    useSession: () => ({ data: DEMO_SESSION, isPending: false, error: null }),
    signOut: async () => ({ data: null, error: null }),
    signIn: {
      social: async () => ({ data: DEMO_SESSION, error: null }),
      email: async () => ({ data: DEMO_SESSION, error: null }),
    },
    signUp: {
      email: async () => ({ data: DEMO_SESSION, error: null }),
    },
    organization: {
      list: async () => ({
        data: DEMO_SESSION.organizations,
        error: null,
      }),
      setActive: async () => ({ data: null, error: null }),
      getActive: async () => ({
        data: {
          organization: DEMO_SESSION.organizations[0],
          member: { id: "member-demo-0001", role: "owner" },
        },
        error: null,
      }),
    },
  } as any
}

export const authClient: any = isDemoMode()
  ? createDemoAuthClient()
  : createAuthClient({
      baseURL: getAuthClientBaseUrl(),
      plugins: [
        organizationClient({
          dynamicAccessControl: {
            enabled: true,
          },
        }),
      ],
    })

export const useSession = isDemoMode()
  ? () => ({ data: DEMO_SESSION, isPending: false, error: null })
  : (authClient.useSession as unknown as () => {
      data: typeof DEMO_SESSION | null
      isPending: boolean
      error: unknown
    })

export const signIn = authClient.signIn
export const signOut = authClient.signOut
export const signUp = authClient.signUp
