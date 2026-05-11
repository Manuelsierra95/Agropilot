"use client"

import { Button } from "@workspace/ui/components/button"
import { ChevronLeftIcon } from "lucide-react"

export function NavDockBackButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.history.back()}
      className="flex size-8 items-center justify-center rounded-lg hover:bg-accent"
      aria-label="Volver"
    >
      <ChevronLeftIcon className="size-3.5 shrink-0" />
    </Button>
  )
}
