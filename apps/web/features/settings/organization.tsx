"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Camera, Crown, Shield, User } from "lucide-react"
import type { OrganizationMeResponse } from "@workspace/schemas"

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  member: <User className="h-3 w-3" />,
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
  const initials = org.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-8">
      {/* Header — idéntico al de Profile */}
      <div>
        <h2 className="text-lg font-medium">Organización</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona los datos de tu explotación y los miembros del equipo.
        </p>
      </div>

      {/* Two-column layout — same divide-x pattern as Profile */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
        {/* ── Left column: editable fields ── */}
        <div className="flex flex-col gap-6 pr-8">
          {/* Logo + org name header */}
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

          {/* Editable fields */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nombre de la explotación</Label>
              <Input
                id="org-name"
                defaultValue={org.name}
                readOnly={!canEdit}
                className={!canEdit ? "text-muted-foreground" : ""}
              />
            </div>
          </div>

          {/* Save actions */}
          {canEdit && (
            <div className="flex items-center gap-3 border-t pt-4">
              <Button>Guardar cambios</Button>
              <Button variant="ghost">Cancelar</Button>
            </div>
          )}
        </div>

        {/* ── Right column: org info + members ── */}
        <div className="flex flex-col gap-6 pl-8">
          {/* Org metadata cards */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Cuenta
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="mt-1 text-sm font-medium">
                  {PLAN_LABELS[org.plan] ?? org.plan}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Tu rol</p>
                <p className="mt-1 text-sm font-medium">
                  {ROLE_LABELS[org.viewerRole] ?? org.viewerRole}
                </p>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="flex flex-col gap-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Miembros{" "}
                <span className="tracking-normal normal-case">
                  ({org.members.length})
                </span>
              </p>
              {canManageMembers && (
                <Button size="sm" variant="outline" className="h-7 text-xs">
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
                const canManage = canManageMembers && !isSelf

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

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        {ROLE_ICONS[m.role]}
                        {ROLE_LABELS[m.role] ?? m.role}
                      </Badge>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        >
                          Expulsar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
