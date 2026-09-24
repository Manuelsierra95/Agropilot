import { z } from "zod"
import { isDemoMode } from "@workspace/web/lib/demo-mode"

const DEFAULT_DEMO_ENV = {
  PUBLIC_API_URL: "http://localhost:3001",
  PUBLIC_API_VERSION: "v1",
  PUBLIC_REDIRECT_URL: "http://localhost:3000/dashboard",
}

const envSchema = z.object({
  PUBLIC_API_URL: z.string().default(DEFAULT_DEMO_ENV.PUBLIC_API_URL),
  PUBLIC_API_VERSION: z.string().default(DEFAULT_DEMO_ENV.PUBLIC_API_VERSION),
  PUBLIC_REDIRECT_URL: z
    .string()
    .default(DEFAULT_DEMO_ENV.PUBLIC_REDIRECT_URL),
})

function loadEnv() {
  const demo = isDemoMode()
  const source = {
    PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
    PUBLIC_REDIRECT_URL: process.env.NEXT_PUBLIC_REDIRECT_URI,
  }

  if (demo) {
    const url = source.PUBLIC_API_URL?.trim() || DEFAULT_DEMO_ENV.PUBLIC_API_URL
    const apiVersion = source.PUBLIC_API_VERSION?.trim() || DEFAULT_DEMO_ENV.PUBLIC_API_VERSION
    const redirectUrl = source.PUBLIC_REDIRECT_URL?.trim() || DEFAULT_DEMO_ENV.PUBLIC_REDIRECT_URL
    return {
      PUBLIC_API_URL: url,
      PUBLIC_API_VERSION: apiVersion,
      PUBLIC_REDIRECT_URL: redirectUrl,
    }
  }

  const result = envSchema.safeParse(source)
  if (!result.success) {
    throw new Error(
      "Error de configuración de entorno: variables inválidas o ausentes"
    )
  }
  return result.data
}

const env = loadEnv()

export { env }
export type env = z.infer<typeof envSchema>

export const apiBaseUrl = env.PUBLIC_API_URL
export const versionedApiUrl = `${apiBaseUrl}/api/${env.PUBLIC_API_VERSION}`

/** Ruta versionada relativa al origen del navegador (p. ej. `/api/v1`). */
export function getVersionedApiPath(): string {
  return `/api/${env.PUBLIC_API_VERSION}`
}

/** URL base de la API para SSR y server actions (no usar en el navegador). */
export function getServerApiBaseUrl(): string {
  const internal = trimEnvValue(process.env.INTERNAL_API_URL)
  if (internal) return internal.replace(/\/$/, "")
  return apiBaseUrl.replace(/\/$/, "")
}

/**
 * URL base del cliente Hono: vacía en el navegador (same-origin vía proxy)
 * y la URL interna/pública en el servidor.
 */
export function getClientApiBaseUrl(): string {
  if (typeof window === "undefined") return getServerApiBaseUrl()
  return ""
}

/** Better Auth exige URL absoluta en SSR/build; en el navegador usa el origen actual. */
export function getAuthClientBaseUrl(): string {
  const authPath = `${getVersionedApiPath()}/auth`
  if (typeof window !== "undefined") {
    return `${window.location.origin}${authPath}`
  }
  return `${getServerApiBaseUrl()}${authPath}`
}

function trimEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined

  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

function resolveWebAppOrigin(): string {
  const explicit = trimEnvValue(process.env.WEB_APP_URL)
  if (explicit) return explicit.replace(/\/$/, "")

  const frontendUri = trimEnvValue(process.env.FRONTEND_URI)
  if (frontendUri) return frontendUri.replace(/\/$/, "")

  const origins = trimEnvValue(process.env.ORIGINS)
    ?.split(",")
    .map((origin) => trimEnvValue(origin))
    .filter((origin): origin is string => Boolean(origin))
  if (origins?.[0]) return origins[0].replace(/\/$/, "")

  const redirectUri = trimEnvValue(process.env.NEXT_PUBLIC_REDIRECT_URI)
  if (redirectUri) {
    try {
      return new URL(redirectUri).origin
    } catch {
      // fall through
    }
  }

  const vercelUrl = trimEnvValue(process.env.VERCEL_URL)
  if (vercelUrl) {
    const host = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`
    try {
      return new URL(host).origin
    } catch {
      // fall through
    }
  }

  try {
    return new URL(env.PUBLIC_REDIRECT_URL).origin
  } catch {
    return "http://localhost:3000"
  }
}

export function webAppUrl(path: string): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, `${resolveWebAppOrigin()}/`)
}
