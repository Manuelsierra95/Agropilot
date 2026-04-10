import { betterAuth } from "better-auth"
import type { Auth, Session, User } from "better-auth"
import { openAPI } from "better-auth/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { db } from "@workspace/db"

const env = {
  NODE_ENV: process.env.NODE_ENV,
  ORIGINS: process.env.ORIGINS?.split(",") || [],
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
}

export const auth = betterAuth({
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.NODE_ENV === "production" ? true : false,
      domain: env.NODE_ENV === "production" ? ".mydomain.com" : undefined,
    },
  },
  trustedOrigins: env.ORIGINS,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
  }),
})

export type { Auth, Session, User }
