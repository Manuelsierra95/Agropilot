import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth"
import type { Auth, Session, User as BetterAuthUser } from "better-auth"
import { openAPI, organization } from "better-auth/plugins"

import { db } from "@workspace/db"
import { getWebAppUrl, sendEmail } from "@workspace/email"
import { buildInvitationEmailHtml } from "@workspace/email/templates/invitation"
import {
  createOrganizationForUser,
  setActiveOrgOnSession,
} from "./hooks/organization"
import { ac, organizationRoles } from "./permissions"

const INVITATION_ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  member: "Miembro",
  viewer: "Solo lectura",
  editor: "Editor",
  owner: "Propietario",
}

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
  user: {
    additionalFields: {
      onboardingStatus: {
        type: "string",
        required: true,
        defaultValue: "not_started",
        input: false,
      },
      onboardingStep: {
        type: "number",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createOrganizationForUser(user)
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          if (!session.activeOrganizationId) {
            await setActiveOrgOnSession(session)
          }
        },
      },
    },
  },
  plugins: [
    organization({
      ac,
      roles: organizationRoles,
      dynamicAccessControl: {
        enabled: true,
      },
      requireEmailVerificationOnInvitation: false,
      cancelPendingInvitationsOnReInvite: true,
      invitationExpiresIn: 60 * 60 * 24 * 7,

      async sendInvitationEmail(data) {
        const { email, organization: org, inviter, invitation } = data
        const inviteUrl = `${getWebAppUrl()}/invite/${invitation.id}`
        const roleLabel =
          INVITATION_ROLE_LABELS[invitation.role ?? "member"] ?? "Miembro"

        await sendEmail({
          to: email,
          subject: `Te han invitado a ${org.name} en Agropilot`,
          html: buildInvitationEmailHtml({
            inviteUrl,
            organizationName: org.name,
            inviterName: inviter.user.name,
            roleLabel,
          }),
        })
      },

      organizationCreation: {
        disabled: true, // no user can call createOrganization from client
      },
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
  onboardingStatus: "not_started" | "in_progress" | "completed"
  onboardingStep: number | null
}
export type { Auth, Session }
export { ac, organizationRoles }
export type { OrganizationRole } from "./permissions"
