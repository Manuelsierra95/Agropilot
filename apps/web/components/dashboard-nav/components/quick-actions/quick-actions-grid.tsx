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
    <div className="flex flex-col gap-3">
      {quickActionsItems.map((group, groupIndex) => (
        <React.Fragment key={group.group}>
          {groupIndex > 0 && <div className="-mx-1 h-px bg-zinc-200" />}
          <div>
            <h4 className="mb-2 px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {group.group}
            </h4>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className="group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                    >
                      <item.icon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
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
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
