"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Mail, Plus } from "lucide-react"
import type { InvitationRole } from "@workspace/schemas"
import {
  DEFAULT_INVITATION_ROLE,
  INVITATION_ROLE_LABELS,
  createInviteDraftId,
  type InviteDraft,
} from "@workspace/web/features/organization/constants"
import { inviteEmailSchema } from "@workspace/web/features/organization/invite-email-schema"
import { InviteDraftList } from "@workspace/web/features/organization/components/invite-draft-list"

type InviteMembersFormProps = {
  invites: InviteDraft[]
  onInvitesChange: (invites: InviteDraft[]) => void
  sent?: boolean
  showDraftList?: boolean
}

export function InviteMembersForm({
  invites,
  onInvitesChange,
  sent = false,
  showDraftList = true,
}: InviteMembersFormProps) {
  const [draftEmail, setDraftEmail] = useState("")
  const [draftRole, setDraftRole] =
    useState<InvitationRole>(DEFAULT_INVITATION_ROLE)
  const [draftError, setDraftError] = useState<string | null>(null)

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
      { id: createInviteDraftId(), email, role: draftRole },
    ])
    setDraftEmail("")
    setDraftRole(DEFAULT_INVITATION_ROLE)
    setDraftError(null)
  }

  const removeInvite = (id: string) => {
    onInvitesChange(invites.filter((invite) => invite.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <p className="text-sm font-medium text-foreground">Nueva invitación</p>
        <div className="space-y-2">
          <Label htmlFor="invite-email">Correo</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="invite-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nombre@empresa.com"
              className="pl-9"
              aria-invalid={draftError ? true : undefined}
              aria-describedby={draftError ? "invite-email-error" : undefined}
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
          <Label htmlFor="invite-role">Rol</Label>
          <Select
            value={draftRole}
            onValueChange={(role: InvitationRole) => setDraftRole(role)}
          >
            <SelectTrigger id="invite-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(INVITATION_ROLE_LABELS) as InvitationRole[]).map(
                (role) => (
                  <SelectItem key={role} value={role}>
                    {INVITATION_ROLE_LABELS[role]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        {draftError ? (
          <p
            id="invite-email-error"
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

      {showDraftList ? (
        <InviteDraftList
          invites={invites}
          sent={sent}
          onRemove={removeInvite}
        />
      ) : null}
    </div>
  )
}
