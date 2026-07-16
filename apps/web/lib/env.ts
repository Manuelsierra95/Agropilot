import { z } from "zod"

const envSchema = z.object({
  PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
  PUBLIC_API_VERSION: z.string().default("v1"),
  PUBLIC_REDIRECT_URL: z
    .string()
    .url()
    .default("http://localhost:3000/dashboard"),
})

const result = envSchema.safeParse({
  PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
  PUBLIC_REDIRECT_URL: process.env.NEXT_PUBLIC_REDIRECT_URI,
})

if (!result.success) {
  throw new Error(
    "Error de configuración de entorno: variables inválidas o ausentes"
  )
}

export const env = result.data
export type env = z.infer<typeof envSchema>

export const apiBaseUrl = env.PUBLIC_API_URL
export const versionedApiUrl = `${apiBaseUrl}/api/${env.PUBLIC_API_VERSION}`

function resolveWebAppOrigin(): string {
  const explicit = process.env.WEB_APP_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  try {
    return new URL(env.PUBLIC_REDIRECT_URL).origin
  } catch {
    return "http://localhost:3000"
  }
}

export const webAppOrigin = resolveWebAppOrigin()

export function webAppUrl(path: string): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, `${webAppOrigin}/`)
}
