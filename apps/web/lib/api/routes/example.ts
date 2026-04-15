import { client } from "@/lib/api/client"

export const exampleApi = {
  public: () => client.api.v1.example.public!.$get({}),
  feed: (query: { page: string; role: "admin" | "member" }) =>
    client.api.v1.example.feed!.$get({
      query,
    }),
  profile: () => client.api.v1.example.profile!.$get({}),
  admin: () => client.api.v1.example.admin!.$get({}),
}
