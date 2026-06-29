"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Separator } from "@workspace/ui/components/separator"
import { SearchMenu } from "@workspace/web/components/dashboard-nav/components/search/search-menu"
import { useNavigationSearchActions } from "@workspace/web/lib/navigation/navigation-actions"
import { cn } from "@workspace/ui/lib/utils"

export function NavDockToggle({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const actions = useNavigationSearchActions()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Nav panel */}
      {isOpen && children}

      {/* Floating dock pill */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1.5 shadow-xl ring-1 ring-border/50">
          {/* Search trigger — dropdown opens upward from here */}
          <SearchMenu
            variant="dock"
            actions={actions}
            placeholder="Search..."
            onFocus={() => setIsOpen(false)}
          />

          <Separator
            orientation="vertical"
            className="mx-1 my-2 shrink-0 self-center"
          />

          {/* Menu toggle */}
          <button
            className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="relative flex size-5 items-center justify-center">
              <Menu
                className={cn(
                  "absolute size-5 transition-all duration-200",
                  isOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"
                )}
              />
              <X
                className={cn(
                  "absolute size-5 transition-all duration-200",
                  isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
                )}
              />
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
