"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"
import { OnboardingSplitLayout } from "@workspace/web/features/onboarding/components/onboarding-split-layout"
import { InviteMembersForm } from "@workspace/web/features/organization/components/invite-members-form"
import { InviteDraftList } from "@workspace/web/features/organization/components/invite-draft-list"
import type { InviteDraft } from "@workspace/web/features/organization/constants"

interface TeamInvitesProps {
  invites: InviteDraft[]
  onInvitesChange: (invites: InviteDraft[]) => void
  initialSent?: boolean
  onContinue?: () => void
  onSkip?: () => void
}

export function TeamInvites({
  invites,
  onInvitesChange,
  initialSent = false,
  onContinue,
  onSkip,
}: TeamInvitesProps) {
  const [sent, setSent] = useState(initialSent)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const resetSendState = () => {
    setSent(false)
    setSendError(null)
  }

  const handleInvitesChange = (nextInvites: InviteDraft[]) => {
    onInvitesChange(nextInvites)
    resetSendState()
  }

  const handleSend = async (): Promise<boolean> => {
    if (sent || isSending) {
      return sent
    }

    const valid = invites.filter((invite) => invite.email.trim().length > 0)
    if (valid.length === 0) return false

    setIsSending(true)
    setSendError(null)

    try {
      const result = await organizationApi.bulkCreateInvitations({
        invitations: valid.map(({ email, role }) => ({ email, role })),
      })

      const sentByEmail = new Map(
        result.invitations.map((invitation) => [
          invitation.email.trim().toLowerCase(),
          invitation.id,
        ])
      )

      onInvitesChange(
        valid.map((invite) => ({
          ...invite,
          id: sentByEmail.get(invite.email.trim().toLowerCase()) ?? invite.id,
        }))
      )

      if (result.failed.length > 0) {
        const failedEmails = result.failed.map((item) => item.email).join(", ")
        setSendError(
          `Se enviaron ${result.count} invitación(es), pero fallaron: ${failedEmails}.`
        )
      }

      setSent(true)
      return true
    } catch {
      setSendError(
        "No se pudieron enviar las invitaciones. Inténtalo de nuevo."
      )
      return false
    } finally {
      setIsSending(false)
    }
  }

  const handleFinish = async () => {
    if (!sent && invites.some((invite) => invite.email.trim())) {
      const success = await handleSend()
      if (!success) return
    }
    onContinue?.()
  }

  const validInviteCount = invites.filter(
    (invite) => invite.email.trim().length > 0
  ).length

  const inviteCountLabel =
    validInviteCount === 0
      ? "Sin invitaciones"
      : validInviteCount === 1
        ? "1 invitación en la lista"
        : `${validInviteCount} invitaciones en la lista`

  const sendLabel =
    validInviteCount === 0
      ? "Añade al menos un correo a la lista"
      : validInviteCount === 1
        ? "Enviar 1 invitación"
        : `Enviar ${validInviteCount} invitaciones`

  return (
    <OnboardingSplitLayout
      previewOnMobile="stack"
      actions={
        <TeamInvitesSendBar
          sent={sent}
          sendLabel={sendLabel}
          validInviteCount={validInviteCount}
          isSending={isSending}
          sendError={sendError}
          onSend={() => void handleSend()}
        />
      }
      footer={
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void handleFinish()}
          >
            Continuar
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={onSkip}
          >
            Omitir este paso
          </Button>
        </div>
      }
      previewHeader={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Tu equipo</p>
            <p className="text-sm text-muted-foreground">{inviteCountLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sent ? <Badge>Invitaciones enviadas</Badge> : null}
          </div>
        </div>
      }
      preview={
        <InviteDraftList
          invites={invites}
          sent={sent}
          onRemove={(id) =>
            handleInvitesChange(invites.filter((invite) => invite.id !== id))
          }
          emptyMessage="Aún no hay invitaciones. Usa el formulario de la izquierda para añadir correos a la lista."
        />
      }
    >
      <div className="flex flex-col gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Invita a tu equipo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Añade correos y roles de tus compañeros. Revisa la lista en la vista
            previa y envía las invitaciones antes de continuar.
          </p>
        </div>

        <InviteMembersForm
          invites={invites}
          onInvitesChange={handleInvitesChange}
          showDraftList={false}
        />
      </div>
    </OnboardingSplitLayout>
  )
}

interface TeamInvitesSendBarProps {
  sent: boolean
  sendLabel: string
  validInviteCount: number
  isSending: boolean
  sendError: string | null
  onSend: () => void
}

function TeamInvitesSendBar({
  sent,
  sendLabel,
  validInviteCount,
  isSending,
  sendError,
  onSend,
}: TeamInvitesSendBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {sent
          ? "Las invitaciones se han enviado por correo electrónico."
          : "Revisa la lista en la vista previa y envía las solicitudes de acceso."}
      </p>
      {sendError ? (
        <p className="text-sm text-destructive">{sendError}</p>
      ) : null}
      <Button
        type="button"
        size="lg"
        variant={sent ? "outline" : "default"}
        className={cn(
          "h-11 w-full gap-2 shadow-sm",
          sent &&
            "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        )}
        onClick={onSend}
        disabled={validInviteCount === 0 || sent || isSending}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : sent ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Invitaciones enviadas
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {sendLabel}
          </>
        )}
      </Button>
    </div>
  )
}
