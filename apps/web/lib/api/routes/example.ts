import { client } from "@workspace/web/lib/api/client"

const apiAny = client.api.v1 as any

export const exampleApi = {
  public: () => apiAny.example.public!.$get({}),
  feed: (query: { page: string; role: "admin" | "member" }) =>
    apiAny.example.feed!.$get({
      query,
    }),
  profile: () => apiAny.example.profile!.$get({}),
  admin: () => apiAny.example.admin!.$get({}),
}
