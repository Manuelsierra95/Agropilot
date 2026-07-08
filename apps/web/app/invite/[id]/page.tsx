import type { Metadata } from "next"
import { AcceptInvitation } from "@workspace/web/features/organization/accept-invitation"

export const metadata: Metadata = {
  title: "Aceptar invitación | Agropilot",
  description: "Acepta la invitación para unirte a una organización en Agropilot.",
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { id } = await params
  return (
    <main className="container mx-auto px-4">
      <AcceptInvitation invitationId={id} />
    </main>
  )
}
