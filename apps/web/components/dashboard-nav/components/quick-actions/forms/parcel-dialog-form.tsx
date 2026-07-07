"use client"

import { useState } from "react"
import { CreateParcelDashboardDialog } from "@workspace/web/features/parcel/components/create-parcel-dashboard-dialog"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

export function ParcelDialogForm({ onSuccess }: MiniFormProps) {
  const [open, setOpen] = useState(true)

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      onSuccess()
    }
    setOpen(nextOpen)
  }

  return (
    <CreateParcelDashboardDialog open={open} onOpenChange={handleClose} />
  )
}
