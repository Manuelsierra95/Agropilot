"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
import type { UserMeResponse } from "@workspace/schemas"
import { useDeleteAccount } from "@workspace/web/features/settings/hooks/use-delete-account"
import { useDeleteOrganization } from "@workspace/web/features/settings/hooks/use-delete-organization"

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
}

export function SettingsProfileSection({ user }: { user: UserMeResponse }) {
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deleteOrganizationOpen, setDeleteOrganizationOpen] = useState(false)

  const deleteAccount = useDeleteAccount()
  const deleteOrganization = useDeleteOrganization()

  const isOwner = user.role === "owner"
  const isDeleting =
    deleteAccount.isPending || deleteOrganization.isPending

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const createdAtFormatted = new Date(user.createdAt).toLocaleDateString(
    "es-ES",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  )

  const handleDeleteAccount = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    deleteAccount.mutate(undefined, {
      onSuccess: () => setDeleteAccountOpen(false),
    })
  }

  const handleDeleteOrganization = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    deleteOrganization.mutate(user.organizationId, {
      onSuccess: () => setDeleteOrganizationOpen(false),
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona tu información personal y el acceso a tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
        {/* Left column — editable fields */}
        <div className="flex flex-col gap-6 pr-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.image ?? ""} alt={user.name} />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{user.name}</p>
              <Badge variant="secondary" className="w-fit text-xs">
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" defaultValue={user.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} readOnly />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar directamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t pt-4">
            <Button>Guardar cambios</Button>
            <Button variant="ghost">Cancelar</Button>
          </div>
        </div>

        {/* Right column — account info + danger zone */}
        <div className="flex flex-col gap-6 pl-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Cuenta
            </p>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium">
                  {PROVIDER_LABELS[user.provider] ?? user.provider}
                </p>
                <p className="text-xs text-muted-foreground">
                  Proveedor de acceso
                </p>
              </div>
              <Badge variant="secondary">OAuth</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Rol</p>
                <p className="mt-1 text-sm font-medium">
                  {ROLE_LABELS[user.role] ?? user.role}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Miembro desde</p>
                <p className="mt-1 text-sm font-medium">{createdAtFormatted}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Zona de peligro
            </p>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Eliminar cuenta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Elimina tu usuario y todos los datos asociados de forma
                    permanente. No afecta a la organización.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setDeleteAccountOpen(true)}
                >
                  Eliminar Cuenta
                </Button>
              </div>
            </div>

            {isOwner ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      Eliminar organización
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Elimina permanentemente tu organización, todos los usuarios
                      y datos asociados.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setDeleteOrganizationOpen(true)}
                  >
                    Eliminar Organización
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Eliminar cuenta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente la cuenta de{" "}
              <span className="font-semibold text-foreground">{user.email}</span>
              . Se borrarán tus datos personales y cerrarás sesión en todos los
              dispositivos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccount.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? "Eliminando..." : "Eliminar cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteOrganizationOpen}
        onOpenChange={setDeleteOrganizationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Eliminar organización
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente tu organización y todos los datos
              asociados: parcelas, finanzas, miembros e invitaciones. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrganization.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteOrganization}
              disabled={deleteOrganization.isPending}
            >
              {deleteOrganization.isPending
                ? "Eliminando..."
                : "Eliminar organización"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
