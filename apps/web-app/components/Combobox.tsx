'use client'

import * as React from 'react'
import { Check, MapPin } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'
import { buttonVariants } from '@workspace/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'

interface Parcel {
  name: string
  id: string
}

interface ParcelComboboxProps {
  parcels: Parcel[]
  selectedParcelId?: string | null
  onSelectParcel: (id: string | null) => void
}

export function ParcelCombobox({
  parcels,
  selectedParcelId,
  onSelectParcel,
}: ParcelComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedParcel = parcels.find(
    (parcel) => parcel.id === selectedParcelId
  )
  const IconComponent = MapPin

  const handleSelectParcel = (id: string) => {
    const newValue = id === selectedParcelId ? '' : id
    if (newValue) {
      onSelectParcel(newValue)
    } else {
      onSelectParcel(null)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {!selectedParcel ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'size-12 rounded-full'
              )}
            >
              <IconComponent className="size-4" />
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Seleccionar parcela</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'size-12 rounded-full'
          )}
        >
          <IconComponent className="size-4" />
        </PopoverTrigger>
      )}
      <PopoverContent className="w-[200px] p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {parcels.map((parcel) => (
            <button
              key={parcel.id}
              onClick={() => handleSelectParcel(parcel.id)}
              className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                selectedParcelId === parcel.id && 'bg-accent'
              )}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  selectedParcelId === parcel.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              {parcel.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
