"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Camera, Crown, Shield, User } from "lucide-react"
import type { OrganizationMeResponse } from "@workspace/schemas"
import { InviteMembersDialog } from "@workspace/web/features/organization/components/invite-members-dialog"
import { PendingInvitationsList } from "@workspace/web/features/organization/components/pending-invitations-list"
import { MEMBER_ROLE_LABELS } from "@workspace/web/features/organization/constants"
import { useCancelInvitation } from "@workspace/web/features/organization/hooks/use-cancel-invitation"
import { useOrganizationInvitations } from "@workspace/web/features/organization/hooks/use-organization-invitations"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  member: <User className="h-3 w-3" />,
  editor: <User className="h-3 w-3" />,
  viewer: <User className="h-3 w-3" />,
}

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuito",
  pro: "Pro",
  enterprise: "Enterprise",
}

type Props = {
  org: OrganizationMeResponse
  canEdit: boolean
  canManageMembers: boolean
}

export function SettingsOrganizationSection({
  org,
  canEdit,
  canManageMembers,
}: Props) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const { data: invitations = [] } = useOrganizationInvitations(
    org.id,
    canManageMembers
  )
  const cancelInvitation = useCancelInvitation(org.id)

  const initials = org.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Organización</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona los datos de tu organización y los miembros del equipo.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="flex flex-col gap-6 pb-8 md:pb-0 md:pr-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-14 w-14 rounded-lg">
                <AvatarImage src={org.logo ?? ""} alt={org.name} />
                <AvatarFallback className="rounded-lg bg-muted text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <button className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted">
                  <Camera className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{org.name}</p>
              <Badge variant="secondary" className="w-fit text-xs">
                {PLAN_LABELS[org.plan] ?? org.plan}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nombre de la organización</Label>
              <Input
                id="org-name"
                defaultValue={org.name}
                readOnly={!canEdit}
                className={!canEdit ? "text-muted-foreground" : ""}
              />
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-3 border-t pt-4">
              <Button>Guardar cambios</Button>
              <Button variant="ghost">Cancelar</Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 pt-8 md:pt-0 md:pl-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Cuenta
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="mt-1 text-sm font-medium">
                  {PLAN_LABELS[org.plan] ?? org.plan}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Tu rol</p>
                <p className="mt-1 text-sm font-medium">
                  {MEMBER_ROLE_LABELS[org.viewerRole] ?? org.viewerRole}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Miembros{" "}
                <span className="tracking-normal normal-case">
                  ({org.members.length})
                </span>
              </p>
              {canManageMembers && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setInviteDialogOpen(true)}
                >
                  Invitar miembro
                </Button>
              )}
            </div>

            <div className="divide-y rounded-lg border">
              {org.members.map((m) => {
                const memberInitials = m.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()

                const isSelf = m.userId === org.viewerUserId

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.image ?? ""} alt={m.name} />
                        <AvatarFallback className="text-xs">
                          {memberInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm leading-none font-medium">
                          {m.name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (tú)
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {m.email}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="gap-1 text-xs">
                      {ROLE_ICONS[m.role]}
                      {MEMBER_ROLE_LABELS[m.role] ?? m.role}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          {canManageMembers ? (
            <PendingInvitationsList
              invitations={invitations}
              canManage={canManageMembers}
              cancellingId={
                cancelInvitation.isPending
                  ? (cancelInvitation.variables ?? null)
                  : null
              }
              onCancel={(id) =>
                new Promise<void>((resolve, reject) => {
                  cancelInvitation.mutate(id, {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                  })
                })
              }
            />
          ) : null}
        </div>
      </div>

      <InviteMembersDialog
        organizationId={org.id}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  )
}
