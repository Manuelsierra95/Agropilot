"use client"

import * as React from "react"
import Link from "next/link"
import { MenuItemButton } from "@workspace/web/components/dashboard-nav/components/quick-actions/menu-item-button"
import { formMap } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms"
import { quickActionsItems } from "@workspace/web/components/dashboard-nav/components/quick-actions/quick-actions-items"

interface QuickActionsGridProps {
  onSelect: (id: string) => void
  onClose: () => void
  activeForm: string | null
}

export function QuickActionsGrid({
  onSelect,
  onClose,
  activeForm,
}: QuickActionsGridProps) {
  return (
    <div className="flex flex-col gap-1">
      {quickActionsItems.map((item) => {
        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className="group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              <item.icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        }

        if (!formMap[item.id]) return null
        return (
          <MenuItemButton
            key={item.id}
            item={item}
            isActive={activeForm === item.id}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}
