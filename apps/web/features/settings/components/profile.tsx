"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { AlertTriangle, Camera, User } from "lucide-react"

export function SettingsProfileSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Administra tu informacion de usuario y seguridad basica de la cuenta.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
            <AvatarFallback className="bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Camera className="h-4 w-4" />
              Cambiar imagen
            </Button>
            <p className="text-xs text-muted-foreground">
              Campo users.image (JPG, PNG o GIF. Max 2MB).
            </p>
          </div>
        </div>

        <div className="grid max-w-md gap-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">Nombre</Label>
            <Input
              id="display-name"
              placeholder="Nombre visible"
              defaultValue="John Doe"
            />
            <p className="text-xs text-muted-foreground">Campo users.name.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email actual</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                type="email"
                defaultValue="john@example.com"
                readOnly
              />
              <Badge variant="secondary" className="font-normal">
                Verificado
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Campos users.email y users.emailVerified.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">Cambiar email</Label>
            <Input id="new-email" type="email" placeholder="nuevo@email.com" />
            <Button variant="outline" className="w-fit">
              Solicitar cambio de email
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Descripcion breve"
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t pt-4">
          <Button>Guardar cambios</Button>
          <Button variant="ghost">Cancelar</Button>
        </div>

        <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1 space-y-1">
              <Label className="text-destructive">Eliminar cuenta</Label>
              <p className="text-sm text-muted-foreground">
                Esta accion elimina tu usuario y datos asociados de forma
                permanente.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
