"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Mail, Plus } from "lucide-react"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"
import { OnboardingSplitLayout } from "@workspace/web/features/onboarding/components/onboarding-split-layout"
import { TeamInvitesPreview, TeamInvitesSendBar } from "@workspace/web/features/onboarding/components/team/team-preview"
import {
  TEAM_ROLE_LABELS,
  type TeamInviteDraft,
  type TeamInviteRole,
} from "@workspace/web/features/onboarding/mocks/onboarding-mocks"

function createInviteId() {
  return `invite-${crypto.randomUUID()}`
}

const DEFAULT_DRAFT_ROLE: TeamInviteRole = "member"

const inviteEmailSchema = z
  .string()
  .trim()
  .min(1, "Introduce un correo electrónico.")
  .email("Introduce un correo válido (por ejemplo, nombre@empresa.com).")

interface TeamInvitesProps {
  invites: TeamInviteDraft[]
  onInvitesChange: (invites: TeamInviteDraft[]) => void
  onContinue?: () => void
  onSkip?: () => void
}

export function TeamInvites({
  invites,
  onInvitesChange,
  onContinue,
  onSkip,
}: TeamInvitesProps) {
  const [sent, setSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [draftEmail, setDraftEmail] = useState("")
  const [draftRole, setDraftRole] = useState<TeamInviteRole>(DEFAULT_DRAFT_ROLE)
  const [draftError, setDraftError] = useState<string | null>(null)

  const resetSendState = () => {
    setSent(false)
    setSendError(null)
  }

  const removeInvite = (id: string) => {
    onInvitesChange(invites.filter((invite) => invite.id !== id))
    resetSendState()
  }

  const handleAddToList = () => {
    const parsed = inviteEmailSchema.safeParse(draftEmail)
    if (!parsed.success) {
      setDraftError(parsed.error.issues[0]?.message ?? "Correo no válido.")
      return
    }

    const email = parsed.data
    const normalized = email.toLowerCase()
    if (
      invites.some((invite) => invite.email.trim().toLowerCase() === normalized)
    ) {
      setDraftError("Ese correo ya está en la lista.")
      return
    }

    onInvitesChange([
      ...invites,
      { id: createInviteId(), email, role: draftRole },
    ])
    setDraftEmail("")
    setDraftRole(DEFAULT_DRAFT_ROLE)
    setDraftError(null)
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
        <TeamInvitesPreview
          invites={invites}
          sent={sent}
          onRemove={removeInvite}
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

        <div className="space-y-4 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Nueva invitación
          </p>
          <div className="space-y-2">
            <Label htmlFor="team-invite-email">Correo</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="team-invite-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
                className="pl-9"
                aria-invalid={draftError ? true : undefined}
                aria-describedby={
                  draftError ? "team-invite-email-error" : undefined
                }
                value={draftEmail}
                onChange={(e) => {
                  setDraftEmail(e.target.value)
                  setDraftError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddToList()
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-invite-role">Rol</Label>
            <Select
              value={draftRole}
              onValueChange={(role: TeamInviteRole) => setDraftRole(role)}
            >
              <SelectTrigger id="team-invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TEAM_ROLE_LABELS) as TeamInviteRole[]).map(
                  (role) => (
                    <SelectItem key={role} value={role}>
                      {TEAM_ROLE_LABELS[role]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          {draftError ? (
            <p
              id="team-invite-email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {draftError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={handleAddToList}
          >
            <Plus className="h-4 w-4" />
            Añadir a la lista
          </Button>
        </div>
      </div>
    </OnboardingSplitLayout>
  )
}
