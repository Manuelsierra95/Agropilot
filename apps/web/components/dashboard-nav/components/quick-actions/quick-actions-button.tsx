"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { QuickActionsGrid } from "@workspace/web/components/dashboard-nav/components/quick-actions/quick-actions-grid"
import { FormContent } from "@workspace/web/components/dashboard-nav/components/quick-actions/form-content"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

export function QuickActionsButton() {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [activeForm, setActiveForm] = React.useState<string | null>(null)

  function handleSelectItem(id: string) {
    setActiveForm(id)
  }

  function handleSuccess() {
    setActiveForm(null)
    setMenuOpen(false)
  }

  function handleBack() {
    setActiveForm(null)
  }

  function handleMenuOpenChange(open: boolean) {
    setMenuOpen(open)
    if (!open) setActiveForm(null)
  }

  return (
    <Popover open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Plus className="size-3.5 shrink-0 sm:text-muted-foreground" />
          <span className="hidden truncate text-xs font-medium sm:inline sm:text-sm">
            Añadir
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={isMobile ? 9 : 6}
        className="w-80 rounded-md p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {activeForm ? (
          <FormContent
            activeForm={activeForm}
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        ) : (
          <QuickActionsGrid
            onSelect={handleSelectItem}
            onClose={() => setMenuOpen(false)}
            activeForm={activeForm}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
