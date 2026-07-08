"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Loader2 } from "lucide-react"
import { InviteMembersForm } from "@workspace/web/features/organization/components/invite-members-form"
import type { InviteDraft } from "@workspace/web/features/organization/constants"
import { useBulkCreateInvitations } from "@workspace/web/features/organization/hooks/use-bulk-create-invitations"

type InviteMembersDialogProps = {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMembersDialog({
  organizationId,
  open,
  onOpenChange,
}: InviteMembersDialogProps) {
  const [invites, setInvites] = useState<InviteDraft[]>([])
  const bulkCreate = useBulkCreateInvitations(organizationId)

  const validInvites = invites.filter((invite) => invite.email.trim().length > 0)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !bulkCreate.isPending) {
      setInvites([])
    }
    onOpenChange(nextOpen)
  }

  const handleSend = () => {
    if (validInvites.length === 0) return

    bulkCreate.mutate(
      {
        invitations: validInvites.map(({ email, role }) => ({ email, role })),
      },
      {
        onSuccess: (result) => {
          if (result.failed.length === 0) {
            setInvites([])
            onOpenChange(false)
          }
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invitar miembros</DialogTitle>
          <DialogDescription>
            Añade correos y roles. Se enviará un email con el enlace para unirse
            a la organización.
          </DialogDescription>
        </DialogHeader>

        <InviteMembersForm invites={invites} onInvitesChange={setInvites} />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={bulkCreate.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={validInvites.length === 0 || bulkCreate.isPending}
          >
            {bulkCreate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : validInvites.length === 1 ? (
              "Enviar invitación"
            ) : (
              `Enviar ${validInvites.length} invitaciones`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
