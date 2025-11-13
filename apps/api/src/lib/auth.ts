import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import type { Context } from 'hono'
import type { Env } from '@env'
import type { CustomContext } from 'globals'

import * as schema from '@/db/auth-schema.sql'

import { ORIGINS } from '@/config/constants'

import { openAPI } from 'better-auth/plugins'

let authInstance: ReturnType<typeof betterAuth>

export function getAuth(c: Context<{ Bindings: Env } & CustomContext>) {
  if (!authInstance) {
    authInstance = betterAuth({
      advanced: {
        defaultCookieAttributes: {
          httpOnly: true,
          sameSite: 'lax',
        },
      },
      trustedOrigins: ORIGINS,
      secret: c.env.BETTER_AUTH_SECRET,
      baseURL: c.env.BETTER_AUTH_URL,
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: c.env.GOOGLE_CLIENT_ID!,
          clientSecret: c.env.GOOGLE_CLIENT_SECRET!,
        },
      },
      plugins: [openAPI()],
      database: drizzleAdapter(
        drizzleD1(c.env.DB, {
          schema: {
            ...schema,
          },
        }),
        {
          provider: 'sqlite',
          usePlural: true,
        }
      ),
    })
  }
  return authInstance
}
