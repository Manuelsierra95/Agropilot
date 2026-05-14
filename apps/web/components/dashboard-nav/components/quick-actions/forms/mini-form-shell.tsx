"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"

type MiniFormShellProps = {
  children: React.ReactNode
  submitLabel: string
  loading: boolean
}

export function MiniFormShell({
  children,
  submitLabel,
  loading,
}: MiniFormShellProps) {
  return (
    <div className="flex flex-col gap-3 p-3">
      {children}
      <Button
        type="submit"
        size="sm"
        disabled={loading}
        className="mt-0.5 w-full"
      >
        {loading ? "Guardando…" : submitLabel}
      </Button>
    </div>
  )
}
