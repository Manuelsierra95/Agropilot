"use client"

import { cn } from "@workspace/ui/lib/utils"
import type { QuickActionsItem } from "@workspace/web/components/dashboard-nav/components/quick-actions/quick-actions-items"
import { Button } from "@workspace/ui/components/button"

interface MenuItemButtonProps {
  item: QuickActionsItem
  isActive: boolean
  onSelect: (id: string) => void
}

export function MenuItemButton({
  item,
  isActive,
  onSelect,
}: MenuItemButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "group flex w-full items-center justify-start gap-2 rounded-sm px-2 py-1.5 ...",
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
    </Button>
  )
}
