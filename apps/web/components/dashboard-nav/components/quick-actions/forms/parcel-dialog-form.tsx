"use client"

import { useState } from "react"
import { CreateParcelDialog } from "@workspace/web/components/parcel"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

export function ParcelDialogForm({ onSuccess }: MiniFormProps) {
  const [open, setOpen] = useState(true)

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      onSuccess()
    }
    setOpen(nextOpen)
  }

  return <CreateParcelDialog open={open} onOpenChange={handleClose} />
}
