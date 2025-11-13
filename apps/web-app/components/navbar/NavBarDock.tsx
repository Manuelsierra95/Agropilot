'use client'

import {
  CalendarIcon,
  HomeIcon,
  PencilIcon,
  SettingsIcon,
  DollarSignIcon,
  PackageIcon,
  LogOutIcon,
  FileDown,
  ChartPie,
} from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'
import { Dock, DockIcon } from '@workspace/ui/components/dock'

const page = '/dashboard'

const DATA = {
  navbar: [
    { href: page + '/', icon: HomeIcon, label: 'Inicio' },
    { href: page + '/calendario', icon: CalendarIcon, label: 'Calendario' },
    { href: page + '/finanzas', icon: DollarSignIcon, label: 'Finanzas' },
    { href: page + '/estadisticas', icon: ChartPie, label: 'Estadísticas' },
  ],
  utils: [
    { name: 'Exportar a Excel', url: '#', icon: FileDown },
    { name: 'Configuración', url: page + '/settings', icon: SettingsIcon },
  ],
}

export function NavBarDock() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <TooltipProvider>
        <Dock direction="middle">
          {DATA.navbar.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12 rounded-full'
                    )}
                  >
                    <item.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          <Separator orientation="vertical" className="h-full" />
          {/* <DockIcon>
            <Parcel />
          </DockIcon> */}
          {DATA.utils.map((util) => (
            <DockIcon key={util.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={util.url}
                    aria-label={util.name}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12 rounded-full '
                    )}
                  >
                    <util.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{util.name}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        </Dock>
      </TooltipProvider>
    </div>
  )
}
