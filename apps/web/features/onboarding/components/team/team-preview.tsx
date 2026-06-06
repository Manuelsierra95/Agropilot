"use client"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { CheckCircle2, Send, Trash2 } from "lucide-react"
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
  sentMock: boolean
  sendLabel: string
  validInviteCount: number
  onSend: () => void
}

export function TeamInvitesSendBar({
  sentMock,
  sendLabel,
  validInviteCount,
  onSend,
}: TeamInvitesSendBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {sentMock
          ? "Listo en modo demo. Al conectar la API, se enviarán por correo."
          : "Revisa la lista en la vista previa y envía las solicitudes de acceso."}
      </p>
      <Button
        type="button"
        size="lg"
        variant={sentMock ? "outline" : "default"}
        className={cn(
          "h-11 w-full gap-2 shadow-sm",
          sentMock &&
            "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        )}
        onClick={onSend}
        disabled={validInviteCount === 0 || sentMock}
      >
        {sentMock ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Invitaciones preparadas
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
  sentMock: boolean
  onRemove: (id: string) => void
}

export function TeamInvitesPreview({
  invites,
  sentMock,
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
                    {sentMock ? (
                      <Badge variant="outline" className="text-xs">
                        Preparada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(invite.id)}
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
