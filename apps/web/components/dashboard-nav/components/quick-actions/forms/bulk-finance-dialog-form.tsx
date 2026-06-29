"use client"

import { useState } from "react"
import { BulkFinanceDialog } from "@workspace/web/components/finance/bulk-finance-dialog"
import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"

export function BulkFinanceDialogForm({ onSuccess }: MiniFormProps) {
  const [open, setOpen] = useState(true)

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      onSuccess()
    }
    setOpen(nextOpen)
  }

  return <BulkFinanceDialog open={open} onOpenChange={handleClose} />
}
