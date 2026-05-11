"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { QuickAddItem } from "./quick-add-items"

interface MenuItemButtonProps {
  item: QuickAddItem
  isActive: boolean
  isMobile: boolean
  onSelect: (id: string) => void
}

export function MenuItemButton({
  item,
  isActive,
  isMobile,
  onSelect,
}: MenuItemButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={() => onSelect(item.id)}
    >
      <item.icon
        className={cn(
          "size-3.5 shrink-0 transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="truncate">{item.label}</span>

      {isMobile ? (
        <ChevronRight
          className={cn(
            "ml-auto size-3.5 shrink-0 transition-all duration-200",
            isActive
              ? "rotate-90 text-foreground"
              : "rotate-0 text-muted-foreground/50 group-hover:text-muted-foreground"
          )}
        />
      ) : (
        <ChevronRight
          className={cn(
            "ml-auto size-3.5 shrink-0 transition-all duration-200",
            isActive
              ? "rotate-180 text-foreground"
              : "rotate-0 text-muted-foreground/50 group-hover:text-muted-foreground"
          )}
        />
      )}
    </Button>
  )
}
