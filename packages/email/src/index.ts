import { Resend } from "resend"

export type SendEmailInput = {
  to: string
  subject: string
  html: string
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ?? "Agropilot <onboarding@resend.dev>"
  )
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<void> {
  const resend = getResendClient()

  if (!resend) {
    console.info(
      `[email] RESEND_API_KEY not set — skipping delivery to ${to}\nSubject: ${subject}\n${html}`
    )
    return
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(error.message ?? "Failed to send email")
  }
}

export function getWebAppUrl(): string {
  const explicit = process.env.WEB_APP_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  const frontendUri = process.env.FRONTEND_URI?.trim()
  if (frontendUri) return frontendUri.replace(/\/$/, "")

  const origins = process.env.ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
  if (origins?.[0]) return origins[0].replace(/\/$/, "")

  return "http://localhost:3000"
}
