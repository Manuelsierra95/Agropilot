"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Loader2, X } from "lucide-react"
import type { InvitationSelect } from "@workspace/schemas"
import {
  INVITATION_ROLE_LABELS,
  type InvitationRole,
} from "@workspace/web/features/organization/constants"

function emailInitial(email: string) {
  const trimmed = email.trim()
  if (!trimmed) return "?"
  return trimmed.charAt(0).toUpperCase()
}

type PendingInvitationsListProps = {
  invitations: InvitationSelect[]
  canManage: boolean
  cancellingId?: string | null
  onCancel?: (id: string) => Promise<void> | void
}

export function PendingInvitationsList({
  invitations,
  canManage,
  cancellingId,
  onCancel,
}: PendingInvitationsListProps) {
  const [invitationToCancel, setInvitationToCancel] =
    useState<InvitationSelect | null>(null)

  const pending = invitations.filter(
    (invitation) => invitation.status === "pending"
  )

  if (pending.length === 0) {
    return null
  }

  const handleConfirmCancel = async () => {
    if (!invitationToCancel || !onCancel) return

    try {
      await onCancel(invitationToCancel.id)
      setInvitationToCancel(null)
    } catch {
      // El hook muestra el toast de error y revierte el estado optimista.
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-t pt-4">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Invitaciones pendientes{" "}
          <span className="tracking-normal normal-case">({pending.length})</span>
        </p>
        <div className="divide-y rounded-lg border">
          {pending.map((invitation) => {
            const role = invitation.role as InvitationRole | null
            const roleLabel =
              role && role in INVITATION_ROLE_LABELS
                ? INVITATION_ROLE_LABELS[role]
                : (role ?? "Miembro")

            return (
              <div
                key={invitation.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {emailInitial(invitation.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm leading-none font-medium"
                      title={invitation.email}
                    >
                      {invitation.email}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Pendiente
                  </Badge>
                  {canManage && onCancel ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      disabled={cancellingId === invitation.id}
                      onClick={() => setInvitationToCancel(invitation)}
                    >
                      {cancellingId === invitation.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <X className="mr-1 h-3.5 w-3.5" />
                          Cancelar
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AlertDialog
        open={invitationToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setInvitationToCancel(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se revocará la invitación enviada a{" "}
              <strong>{invitationToCancel?.email}</strong>. El enlace dejará de
              ser válido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(cancellingId)}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={Boolean(cancellingId)}
              onClick={(event) => {
                event.preventDefault()
                handleConfirmCancel()
              }}
            >
              {cancellingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar invitación"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
