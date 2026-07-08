"use client"

import * as React from "react"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

import { HarvestMiniForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/harvest-mini-form"

type RegisterHarvestDeliveryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  parcelId?: string
}

export function RegisterHarvestDeliveryModal({
  open,
  onOpenChange,
  parcelId,
}: RegisterHarvestDeliveryModalProps) {
  const isMobile = useIsMobile()

  const handleSuccess = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const content = (
    <HarvestMiniForm onSuccess={handleSuccess} parcelId={parcelId} />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex max-h-[90vh] flex-col">
          <DrawerHeader className="gap-0 pb-2 text-left">
            <DrawerTitle className="sr-only">
              Registrar entrega de cosecha
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Formulario para registrar una entrega a cooperativa o almacén
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="sr-only">
          <SheetTitle>Registrar entrega de cosecha</SheetTitle>
          <SheetDescription>
            Formulario para registrar una entrega a cooperativa o almacén
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{content}</div>
      </SheetContent>
    </Sheet>
  )
}
