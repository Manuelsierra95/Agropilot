"use client"

import * as React from "react"
import { MenuItemButton } from "./menu-item-button"
import { formMap } from "./forms"
import { quickActionsItems } from "./quick-actions-items"

interface QuickActionsGridProps {
  onSelect: (id: string) => void
  activeForm: string | null
}

export function QuickActionsGrid({
  onSelect,
  activeForm,
}: QuickActionsGridProps) {
  return (
    <div className="flex flex-col gap-3">
      {quickActionsItems.map((group, groupIndex) => (
        <React.Fragment key={group.group}>
          {groupIndex > 0 && <div className="-mx-1 h-px bg-zinc-200" />}
          <div>
            <h4 className="mb-2 px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {group.group}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => {
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
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
