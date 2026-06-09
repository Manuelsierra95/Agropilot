import { testMember, testSession, testUser } from "./fixtures"

export const authMocks = globalThis.__authMocks

export function mockAuthenticatedSession(role = "owner") {
  authMocks.getSession.mockResolvedValue({
    user: testUser,
    session: testSession,
  })
  authMocks.findMember.mockResolvedValue(testMember(role))
}

export function mockUnauthenticated() {
  authMocks.getSession.mockResolvedValue(null)
  authMocks.findMember.mockResolvedValue(null)
}

export function mockSessionWithoutOrg() {
  authMocks.getSession.mockResolvedValue({
    user: testUser,
    session: { ...testSession, activeOrganizationId: null },
  })
}

export function mockSessionWithoutMembership() {
  authMocks.getSession.mockResolvedValue({
    user: testUser,
    session: testSession,
  })
  authMocks.findMember.mockResolvedValue(null)
}
