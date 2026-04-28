"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import type { UserMeResponse } from "@workspace/schemas"
import DeleteButton from "./components/delete-button"

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  email: "Email / contraseña",
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
}

export function SettingsProfileSection({ user }: { user: UserMeResponse }) {
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona tu información personal y el acceso a tu cuenta.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? ""} alt={user.name} />
            <AvatarFallback className="bg-muted text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid max-w-md gap-5">
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

          <div className="space-y-2">
            <Label>Proveedor de acceso</Label>
            <div className="flex items-center gap-2">
              <Input
                value={PROVIDER_LABELS[user.provider] ?? user.provider}
                readOnly
                className="text-muted-foreground"
              />
              {user.provider !== "email" && (
                <Badge variant="secondary" className="shrink-0">
                  OAuth
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rol en la organización</Label>
              <Input
                value={ROLE_LABELS[user.role] ?? user.role}
                readOnly
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Miembro desde</Label>
              <Input
                value={createdAtFormatted}
                readOnly
                className="text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t pt-4">
          <Button>Guardar cambios</Button>
          <Button variant="ghost">Cancelar</Button>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Eliminar cuenta
              </p>
              <p className="text-xs text-muted-foreground">
                Elimina tu usuario y todos los datos asociados de forma
                permanente. No afecta a la organización.
              </p>
            </div>
            <DeleteButton />
          </div>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Eliminar organización
              </p>
              <p className="text-xs text-muted-foreground">
                Elimina permanentemente tu organización, todos los usuarios y
                datos asociados.
              </p>
            </div>
            {/* <DeleteButton /> */}
          </div>
        </div>
      </div>
    </div>
  )
}
