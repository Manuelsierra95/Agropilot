import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import type { Context } from 'hono'
import type { Env } from '@env'
import type { CustomContext } from 'globals'

import * as schema from '@/db/auth-schema.sql'
import { DEVORIGINS, ORIGINS } from '@/config/constants'
import { openAPI } from 'better-auth/plugins'
import { beforeHook, afterHook } from '@/lib/hooks'

let authInstance: ReturnType<typeof betterAuth>

export function getAuth(c: Context<{ Bindings: Env } & CustomContext>) {
  if (!authInstance) {
    const isProduction = c.env.NODE_ENV === 'production'

    authInstance = betterAuth({
      advanced: {
        defaultCookieAttributes: {
          sameSite: 'lax',
          secure: isProduction ? true : false,
          domain: isProduction ? '.agropilotapp.es' : undefined,
        },
      },
      trustedOrigins: isProduction ? ORIGINS : DEVORIGINS,
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
      plugins: [...(!isProduction ? [openAPI()] : [])],
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
      hooks: {
        // after: afterHook(c),
        before: beforeHook(c),
      },
    })
  }
  return authInstance
}
