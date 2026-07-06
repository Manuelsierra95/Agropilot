"use client"

import { cn } from "@workspace/ui/lib/utils"
import type { QuickActionsItem } from "@workspace/web/components/dashboard-nav/components/quick-actions/quick-actions-items"

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
    <button
      type="button"
      className={cn(
        "group flex w-full items-center justify-start gap-3 rounded-sm px-2 py-2 text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
      onClick={() => onSelect(item.id)}
    >
      <item.icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="truncate">{item.label}</span>
    </button>
  )
}
