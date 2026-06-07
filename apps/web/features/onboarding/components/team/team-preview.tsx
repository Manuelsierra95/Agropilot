"use client"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { CheckCircle2, Loader2, Send, Trash2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import {
  TEAM_ROLE_LABELS,
  type TeamInviteDraft,
} from "../../mocks/onboarding-mocks"

function emailInitial(email: string) {
  const trimmed = email.trim()
  if (!trimmed) return "?"
  return trimmed.charAt(0).toUpperCase()
}

interface TeamInvitesSendBarProps {
  sent: boolean
  sendLabel: string
  validInviteCount: number
  isSending: boolean
  sendError: string | null
  onSend: () => void
}

export function TeamInvitesSendBar({
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
          ? "Las invitaciones se han creado en tu organización."
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

interface TeamInvitesPreviewProps {
  invites: TeamInviteDraft[]
  sent: boolean
  onRemove: (id: string) => void
}

export function TeamInvitesPreview({
  invites,
  sent,
  onRemove,
}: TeamInvitesPreviewProps) {
  const listedInvites = invites.filter((invite) => invite.email.trim().length > 0)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {listedInvites.length === 0 ? (
          <div className="flex h-full min-h-[8rem] items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Aún no hay invitaciones. Usa el formulario de la izquierda para
            añadir correos a la lista.
          </div>
        ) : (
          <ul className="space-y-2 p-4">
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
                      {TEAM_ROLE_LABELS[invite.role]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {sent ? "Enviada" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
