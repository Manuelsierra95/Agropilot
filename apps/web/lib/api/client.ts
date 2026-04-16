import { hc } from "hono/client"
import type { AppType } from "@workspace/api"
import { versionedApiUrl } from "@/lib/env"

const TOKEN_KEYS = [
  "access_token",
  "token",
  "better-auth.session_token",
] as const

function readTokenFromCookieString(cookieValue: string) {
  const parsed = new Map(
    cookieValue
      .split(";")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const separatorIndex = segment.indexOf("=")

        if (separatorIndex === -1) {
          return [segment, ""]
        }

        return [
          decodeURIComponent(segment.slice(0, separatorIndex)),
          decodeURIComponent(segment.slice(separatorIndex + 1)),
        ]
      })
  )

  for (const key of TOKEN_KEYS) {
    const token = parsed.get(key)

    if (token) {
      return token
    }
  }

  return null
}

async function getServerToken() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()

  for (const key of TOKEN_KEYS) {
    const token = cookieStore.get(key)?.value

    if (token) {
      return token
    }
  }

  return null
}

function getClientToken() {
  if (typeof window === "undefined") {
    return null
  }

  for (const key of TOKEN_KEYS) {
    const fromStorage = window.localStorage.getItem(key)

    if (fromStorage) {
      return fromStorage
    }
  }

  return readTokenFromCookieString(document.cookie)
}

export async function getToken() {
  if (typeof window === "undefined") {
    return getServerToken()
  }

  return getClientToken()
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken()

  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const client = hc<AppType>(versionedApiUrl, {
  init: {
    credentials: "include",
  },
  headers: getAuthHeaders,
})
