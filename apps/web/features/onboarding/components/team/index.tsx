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
import { OnboardingSplitLayout } from "../onboarding-split-layout"
import { TeamInvitesPreview, TeamInvitesSendBar } from "./team-preview"
import {
  MOCK_TEAM_INVITES,
  TEAM_ROLE_LABELS,
  type TeamInviteDraft,
  type TeamInviteRole,
} from "../../mocks/onboarding-mocks"

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
  const [sentMock, setSentMock] = useState(false)
  const [draftEmail, setDraftEmail] = useState("")
  const [draftRole, setDraftRole] = useState<TeamInviteRole>(DEFAULT_DRAFT_ROLE)
  const [draftError, setDraftError] = useState<string | null>(null)

  const displayInvites =
    invites.length > 0 ? invites : MOCK_TEAM_INVITES
  const isUsingMock = invites.length === 0

  const removeInvite = (id: string) => {
    const base = isUsingMock ? [...MOCK_TEAM_INVITES] : [...invites]
    onInvitesChange(base.filter((invite) => invite.id !== id))
    setSentMock(false)
  }

  const handleAddToList = () => {
    const parsed = inviteEmailSchema.safeParse(draftEmail)
    if (!parsed.success) {
      setDraftError(parsed.error.issues[0]?.message ?? "Correo no válido.")
      return
    }

    const email = parsed.data
    const base = isUsingMock ? [...MOCK_TEAM_INVITES] : [...invites]
    const normalized = email.toLowerCase()
    if (
      base.some((invite) => invite.email.trim().toLowerCase() === normalized)
    ) {
      setDraftError("Ese correo ya está en la lista.")
      return
    }

    onInvitesChange([
      ...base,
      { id: createInviteId(), email, role: draftRole },
    ])
    setDraftEmail("")
    setDraftRole(DEFAULT_DRAFT_ROLE)
    setDraftError(null)
    setSentMock(false)
  }

  const handleSendMock = () => {
    const valid = displayInvites.filter(
      (invite) => invite.email.trim().length > 0
    )
    if (valid.length === 0) return
    if (isUsingMock) {
      onInvitesChange(valid)
    }
    setSentMock(true)
  }

  const handleFinish = () => {
    if (!sentMock && displayInvites.some((i) => i.email.trim())) {
      handleSendMock()
    }
    onContinue?.()
  }

  const validInviteCount = displayInvites.filter(
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
          sentMock={sentMock}
          sendLabel={sendLabel}
          validInviteCount={validInviteCount}
          onSend={handleSendMock}
        />
      }
      footer={
        <div className="flex flex-col gap-1">
          <Button type="button" size="lg" className="w-full" onClick={handleFinish}>
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
            {isUsingMock ? (
              <Badge variant="secondary">Datos de ejemplo</Badge>
            ) : null}
            {sentMock ? <Badge>Invitaciones preparadas</Badge> : null}
          </div>
        </div>
      }
      preview={
        <TeamInvitesPreview
          invites={displayInvites}
          sentMock={sentMock}
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

        {isUsingMock && (
          <Badge variant="secondary" className="w-fit">
            Invitaciones de ejemplo en la lista — añade las tuyas o elimínalas
          </Badge>
        )}

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
