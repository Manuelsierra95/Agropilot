import { Plus, Pencil } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { ParcelSelector } from '@/components/dashboardview/parcels/ParcelSelector'
import { NavBarTopAvatar } from '@/components/navbar/NavBarTopAvatar'
import { CreateParcel } from '@/components/dashboardview/parcels/CreateParcel'
import { UpdateParcel } from '@/components/dashboardview/parcels/UpdateParcel'
import Link from 'next/link'

export function NavBarTop() {
  return (
    <header className="z-50 border-b sticky top-0 bg-background/100">
      <div className="flex h-14 w-full items-center gap-2 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
          <h1 className="hidden sm:block shrink-0">
            <Link href="/dashboard" className="font-bold text-lg sm:text-xl">
              Agropilot
            </Link>
          </h1>
          <div className="hidden sm:block h-8 w-px bg-border mx-1 sm:mx-2 shrink-0" />
          <ParcelSelector className="flex-1 min-w-0 w-full max-w-[250px] md:max-w-[300px]" />
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <CreateParcel
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full size-8 sm:size-9"
                  aria-label="Añadir parcela"
                >
                  <Plus className="size-4 sm:size-5" />
                </Button>
              }
            />
            <UpdateParcel
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full size-8 sm:size-9"
                  aria-label="Editar parcela"
                >
                  <Pencil className="size-3.5 sm:size-4" />
                </Button>
              }
            />
          </div>
        </div>
        <NavBarTopAvatar className="ml-4" />
      </div>
    </header>
  )
}
