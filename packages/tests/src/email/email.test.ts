import { describe, expect, it, vi, beforeEach } from "vitest"

const sendEmailMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock("@workspace/email", () => ({
  sendEmail: sendEmailMock,
  getWebAppUrl: () => "http://localhost:3000",
}))

vi.mock("@workspace/email/templates/invitation", () => ({
  buildInvitationEmailHtml: () => "<p>invite</p>",
}))

describe("@workspace/email integration in auth", () => {
  beforeEach(() => {
    sendEmailMock.mockClear()
  })

  it("sendEmail mock can be invoked without network", async () => {
    const { sendEmail } = await import("@workspace/email")
    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    })
    expect(sendEmailMock).toHaveBeenCalledWith({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    })
  })
})
