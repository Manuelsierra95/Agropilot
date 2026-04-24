import { hc } from "hono/client"
import type { AppType } from "@workspace/api"
import { apiBaseUrl } from "@/lib/env"

// TODO: Mejorar manejo de tokens y simplificar el codigo , actualmente se buscan en varias ubicaciones (cookies, localStorage)
// y se incluyen en los headers. Sería ideal unificar esto y manejarlo de forma más consistente
// , posiblemente con un contexto de autenticación o similar.

export const client = hc<AppType>(apiBaseUrl, {
  init: { credentials: "include" },
  headers: async (): Promise<Record<string, string>> => {
    // Server Components
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      return { Cookie: cookieStore.toString() }
    }
    // Client: credentials auto with "include"
    return {}
  },
})

// const TOKEN_KEYS = [
//   "access_token",
//   "token",
//   "better-auth.session_token",
//   "__Secure-better-auth.session_token",
// ] as const

// function readTokenFromCookieString(cookieValue: string) {
//   const parsed = new Map(
//     cookieValue
//       .split(";")
//       .map((segment) => segment.trim())
//       .filter(Boolean)
//       .map((segment) => {
//         const separatorIndex = segment.indexOf("=")

//         if (separatorIndex === -1) {
//           return [segment, ""]
//         }

//         return [
//           decodeURIComponent(segment.slice(0, separatorIndex)),
//           decodeURIComponent(segment.slice(separatorIndex + 1)),
//         ]
//       })
//   )

//   for (const key of TOKEN_KEYS) {
//     const token = parsed.get(key)

//     if (token) {
//       return token
//     }
//   }

//   return null
// }

// async function getServerToken() {
//   const { cookies } = await import("next/headers")
//   const cookieStore = await cookies()

//   for (const key of TOKEN_KEYS) {
//     const token = cookieStore.get(key)?.value

//     if (token) {
//       return token
//     }
//   }

//   return null
// }

// async function getServerCookieHeader() {
//   const { cookies } = await import("next/headers")
//   const cookieStore = await cookies()
//   const serializedCookies = cookieStore.toString()

//   return serializedCookies || null
// }

// function getClientToken() {
//   if (typeof window === "undefined") {
//     return null
//   }

//   for (const key of TOKEN_KEYS) {
//     const fromStorage = window.localStorage.getItem(key)

//     if (fromStorage) {
//       return fromStorage
//     }
//   }

//   return readTokenFromCookieString(document.cookie)
// }

// function getClientCookieHeader() {
//   if (typeof window === "undefined") {
//     return null
//   }

//   return document.cookie || null
// }

// async function getCookieHeader() {
//   if (typeof window === "undefined") {
//     return getServerCookieHeader()
//   }

//   return getClientCookieHeader()
// }

// export async function getToken() {
//   if (typeof window === "undefined") {
//     return getServerToken()
//   }

//   return getClientToken()
// }

// async function getAuthHeaders(): Promise<Record<string, string>> {
//   const [token, cookieHeader] = await Promise.all([
//     getToken(),
//     getCookieHeader(),
//   ])
//   const headers: Record<string, string> = {}

//   if (cookieHeader) {
//     headers.Cookie = cookieHeader
//   }

//   if (token) {
//     headers.Authorization = `Bearer ${token}`
//   }

//   return headers
// }

// export const client = hc<AppType>(apiBaseUrl, {
//   init: {
//     credentials: "include",
//   },
// })

// export async function authedFetch<T>(
//   fetcher: (headers: Record<string, string>) => Promise<T>
// ): Promise<T> {
//   const headers = await getAuthHeaders()
//   return fetcher(headers)
// }
