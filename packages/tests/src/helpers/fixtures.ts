import type { AuthMember, AuthSession, AuthUser } from "@workspace/schemas"

export const TEST_ORG_ID = "org-test-0000-0000-0000-000000000001"
export const TEST_USER_ID = "user-test-0000-0000-0000-000000000001"
export const TEST_SESSION_ID = "session-test-0000-0000-000000000001"
export const TEST_MEMBER_ID = "member-test-0000-0000-000000000001"

export const testUser: AuthUser = {
  id: TEST_USER_ID,
  name: "Test User",
  email: "test@agropilot.dev",
  image: null,
}

export const testSession: AuthSession = {
  id: TEST_SESSION_ID,
  userId: TEST_USER_ID,
  activeOrganizationId: TEST_ORG_ID,
}

export const testMember = (role = "owner"): AuthMember => ({
  id: TEST_MEMBER_ID,
  userId: TEST_USER_ID,
  organizationId: TEST_ORG_ID,
  role,
  createdAt: new Date("2026-01-01T00:00:00Z"),
})

export const adminMember = testMember("admin")
export const viewerMember = testMember("member")
