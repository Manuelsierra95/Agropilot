import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server"
import { api } from "@/lib/api"
import { handleRbacStatus } from "@/lib/api/rbac"

const roleValues = ["admin", "member"] as const

export const feedSearchParams = {
  page: parseAsInteger.withDefault(1),
  role: parseAsStringLiteral(roleValues).withDefault("member"),
}

export const feedSearchParamsCache = createSearchParamsCache(feedSearchParams)

export async function getExampleFeed(
  searchParams: Record<string, string | string[] | undefined>
) {
  const { page, role } = feedSearchParamsCache.parse(searchParams)

  const response = await api.example.feed({
    page: String(page),
    role,
  })

  handleRbacStatus(response)
  return response.json()
}
