import { client } from "@workspace/web/lib/api/client"
import { isDemoMode } from "@workspace/web/lib/demo-mode"

const apiAny = client.api.v1 as any

const DEMO_EXAMPLE_PUBLIC = { items: ["Demo item 1", "Demo item 2"] }
const DEMO_EXAMPLE_FEED = { items: [] as Array<{ id: string; title: string }> }
const DEMO_EXAMPLE_PROFILE = { name: "Demo", role: "admin" }

export const exampleApi = {
  public: async () =>
    isDemoMode() ? DEMO_EXAMPLE_PUBLIC : apiAny.example.public!.$get({}),
  feed: async (query: { page: string; role: "admin" | "member" }) =>
    isDemoMode()
      ? DEMO_EXAMPLE_FEED
      : apiAny.example.feed!.$get({ query }),
  profile: async () =>
    isDemoMode() ? DEMO_EXAMPLE_PROFILE : apiAny.example.profile!.$get({}),
  admin: async () =>
    isDemoMode() ? DEMO_EXAMPLE_PROFILE : apiAny.example.admin!.$get({}),
}
