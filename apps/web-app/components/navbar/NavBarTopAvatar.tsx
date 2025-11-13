'use client'

import { User, Settings, LogOut } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@workspace/ui/components/avatar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { cn } from '@workspace/ui/lib/utils'

interface NavBarTopAvatarProps {
  className?: string
}

export function NavBarTopAvatar({ className }: NavBarTopAvatarProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn('cursor-pointer outline-none', className)}>
          <Avatar>
            <AvatarImage src="" alt="Usuario" />
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={() => console.log('Perfil')}
          >
            <User className="size-4" />
            <span>Perfil</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={() => console.log('Configuración')}
          >
            <Settings className="size-4" />
            <span>Configuración</span>
          </Button>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            className="justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => console.log('Cerrar sesión')}
          >
            <LogOut className="size-4" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
