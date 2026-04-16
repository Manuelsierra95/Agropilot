import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth"
import type { Auth, Session, User as BetterAuthUser } from "better-auth"
import { openAPI, organization } from "better-auth/plugins"

import { db } from "@workspace/db"
import { ac, organizationRoles } from "./permissions"

const env = {
  NODE_ENV: process.env.NODE_ENV,
  ORIGINS: process.env.ORIGINS?.split(",") || [],
  AUTH_COOKIE_DOMAIN: process.env.AUTH_COOKIE_DOMAIN?.trim(),
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
}

const auth = betterAuth({
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.NODE_ENV === "production" ? true : false,
      domain:
        env.NODE_ENV === "production"
          ? env.AUTH_COOKIE_DOMAIN || undefined
          : undefined,
    },
  },
  trustedOrigins: env.ORIGINS,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    organization({
      ac,
      roles: organizationRoles,
      teams: {
        enabled: true,
        allowRemovingAllTeams: false,
      },
      dynamicAccessControl: {
        enabled: true,
      },
      requireEmailVerificationOnInvitation: false,
      cancelPendingInvitationsOnReInvite: true,
    }),
    openAPI(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
})

export { auth }
export type AuthInstance = typeof auth
export type User = BetterAuthUser & {
  activeOrganizationId: string | null
}
export type { Auth, Session }
export { ac, organizationRoles }
export type { OrganizationRole } from "./permissions"
