"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@workspace/ui/components/popover"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { formMap } from "./forms"
import { MenuItemButton } from "./menu-item-button"
import { quickAddItems } from "./quick-add-items"

export function QuickAddButton() {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [activeForm, setActiveForm] = React.useState<string | null>(null)

  function handleSelectItem(id: string) {
    setActiveForm((prev) => (prev === id ? null : id))
  }

  function handleSuccess() {
    setActiveForm(null)
    setMenuOpen(false)
  }

  function handleMenuOpenChange(open: boolean) {
    setMenuOpen(open)
    if (!open) setActiveForm(null)
  }

  const ActiveFormComponent = activeForm ? formMap[activeForm] : null

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
            Añadir rápido
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={isMobile ? 9 : 6}
        className="w-56 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (activeForm) e.preventDefault()
        }}
      >
        <Popover open={!!activeForm}>
          <PopoverAnchor asChild>
            <div className="flex flex-col gap-px">
              {quickAddItems.map((group, groupIndex) => (
                <React.Fragment key={group.group}>
                  {groupIndex > 0 && (
                    <div className="-mx-1 my-1 h-px bg-border" />
                  )}
                  {group.items.map((item) => {
                    if (!formMap[item.id]) return null
                    return (
                      <MenuItemButton
                        key={item.id}
                        item={item}
                        isActive={activeForm === item.id}
                        isMobile={isMobile}
                        onSelect={handleSelectItem}
                      />
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </PopoverAnchor>

          <PopoverContent
            side={isMobile ? "bottom" : "left"}
            align={isMobile ? "end" : "start"}
            sideOffset={8}
            alignOffset={-4}
            className="w-64 p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              const target = e.target as HTMLElement
              const menuContent = document.querySelector(
                "[data-radix-popper-content-wrapper]"
              )
              if (menuContent?.contains(target)) return
              setActiveForm(null)
              setMenuOpen(false)
            }}
          >
            {ActiveFormComponent && (
              <ActiveFormComponent onSuccess={handleSuccess} />
            )}
          </PopoverContent>
        </Popover>
      </PopoverContent>
    </Popover>
  )
}
