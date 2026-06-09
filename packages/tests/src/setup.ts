import { vi } from "vitest"

declare global {
  // eslint-disable-next-line no-var
  var __authMocks: {
    getSession: ReturnType<typeof vi.fn>
    findMember: ReturnType<typeof vi.fn>
  }
}

vi.hoisted(() => {
  globalThis.__authMocks = {
    getSession: vi.fn(),
    findMember: vi.fn(),
  }
})

vi.mock("@workspace/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) =>
        globalThis.__authMocks.getSession(...args),
    },
    handler: vi.fn(),
  },
}))

vi.mock("@workspace/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/db")>()
  return {
    ...actual,
    db: {
      query: {
        members: {
          findFirst: (...args: unknown[]) =>
            globalThis.__authMocks.findMember(...args),
        },
      },
    },
  }
})
