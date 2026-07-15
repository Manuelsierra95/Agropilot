export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001"
export const DEMO_ORGANIZATION_ID = "00000000-0000-4000-8000-000000000002"
export const DEMO_USER_EMAIL = "demo@agropilot.dev"
export const DEMO_ORG_NAME = "Olivares Sierra Mágina"

export function isDemoEnabled(): boolean {
  return process.env.DEMO_ENABLED === "true"
}

export function isDemoUser(userId: string): boolean {
  return userId === DEMO_USER_ID
}
