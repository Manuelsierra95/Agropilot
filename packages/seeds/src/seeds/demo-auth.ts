import { hashPassword } from "better-auth/crypto"
import { eq, db, schema } from "@workspace/db"

import {
  DEMO_ORGANIZATION_ID,
  DEMO_ORG_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
} from "../config"
import { SeedError } from "../errors"

export async function seedDemoAuth() {
  const password = process.env.DEMO_USER_PASSWORD
  if (!password) {
    throw new SeedError(
      "DEMO_PASSWORD_MISSING",
      "Define DEMO_USER_PASSWORD en el entorno antes de ejecutar los seeds."
    )
  }

  const hashedPassword = await hashPassword(password)

  await db
    .insert(schema.users)
    .values({
      id: DEMO_USER_ID,
      name: "Usuario Demo",
      email: DEMO_USER_EMAIL,
      emailVerified: true,
      onboardingStatus: "completed",
      onboardingStep: null,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        name: "Usuario Demo",
        email: DEMO_USER_EMAIL,
        emailVerified: true,
        onboardingStatus: "completed",
        onboardingStep: null,
        updatedAt: new Date(),
      },
    })

  await db
    .insert(schema.organizations)
    .values({
      id: DEMO_ORGANIZATION_ID,
      name: DEMO_ORG_NAME,
      slug: "olivares-sierra-magina-demo",
      plan: "pro",
      status: "active",
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.organizations.id,
      set: {
        name: DEMO_ORG_NAME,
        plan: "pro",
        status: "active",
      },
    })

  await db
    .insert(schema.members)
    .values({
      id: "00000000-0000-4000-8000-000000000003",
      userId: DEMO_USER_ID,
      organizationId: DEMO_ORGANIZATION_ID,
      role: "owner",
      createdAt: new Date(),
    })
    .onConflictDoNothing()

  const existingAccount = await db.query.accounts.findFirst({
    where: eq(schema.accounts.userId, DEMO_USER_ID),
  })

  if (existingAccount) {
    await db
      .update(schema.accounts)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.accounts.id, existingAccount.id))
  } else {
    await db.insert(schema.accounts).values({
      id: "00000000-0000-4000-8000-000000000004",
      accountId: DEMO_USER_ID,
      providerId: "credential",
      userId: DEMO_USER_ID,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  console.log("✓ demo auth (user, organization, member, account)")
}
