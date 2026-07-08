"use client"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Trash2 } from "lucide-react"
import {
  INVITATION_ROLE_LABELS,
  type InviteDraft,
} from "@workspace/web/features/organization/constants"

function emailInitial(email: string) {
  const trimmed = email.trim()
  if (!trimmed) return "?"
  return trimmed.charAt(0).toUpperCase()
}

type InviteDraftListProps = {
  invites: InviteDraft[]
  sent?: boolean
  onRemove?: (id: string) => void
  emptyMessage?: string
}

export function InviteDraftList({
  invites,
  sent = false,
  onRemove,
  emptyMessage = "Aún no hay invitaciones en la lista.",
}: InviteDraftListProps) {
  const listedInvites = invites.filter(
    (invite) => invite.email.trim().length > 0
  )

  if (listedInvites.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {listedInvites.map((invite) => (
        <li
          key={invite.id}
          className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-sm font-medium">
              {emailInitial(invite.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {invite.email.trim()}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {INVITATION_ROLE_LABELS[invite.role]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {sent ? "Enviada" : "Pendiente"}
              </Badge>
            </div>
          </div>
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(invite.id)}
              disabled={sent}
              aria-label={`Eliminar invitación a ${invite.email.trim()}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
