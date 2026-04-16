import { z } from "zod"

const envSchema = z.object({
  PUBLIC_API_URL: z.string().url().default("http://localhost:8787/api"),
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

export const versionedApiUrl = `${env.PUBLIC_API_URL}/${env.PUBLIC_API_VERSION}`
