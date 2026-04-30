"use client"

import * as React from "react"
import {
  SearchIcon,
  HomeIcon,
  LayoutDashboardIcon,
  BarChart3Icon,
  FolderIcon,
  FileTextIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

// ————————————————————————————————————————
// Types
// ————————————————————————————————————————

export interface SearchAction {
  id: string
  name: string
  subtitle?: string
  keywords?: string
  section?: string
  shortcut?: string[]
  icon?: React.ReactNode
  perform?: () => void
}

export interface SearchMenuProps {
  variant?: "sidebar" | "dock"
  placeholder?: string
  className?: string
  actions?: SearchAction[]
  onFocus?: () => void
}

// ————————————————————————————————————————
// Default actions
// ————————————————————————————————————————

const defaultActions: SearchAction[] = [
  {
    id: "home",
    name: "Home",
    shortcut: ["g", "h"],
    keywords: "go home inicio",
    section: "Navigation",
    icon: <HomeIcon className="size-4" />,
    perform: () => (window.location.pathname = "/"),
  },
  {
    id: "dashboard",
    name: "Dashboard",
    shortcut: ["g", "d"],
    keywords: "go dashboard panel",
    section: "Navigation",
    icon: <LayoutDashboardIcon className="size-4" />,
  },
  {
    id: "analytics",
    name: "Analytics",
    shortcut: ["g", "a"],
    keywords: "analytics stats estadísticas",
    section: "Navigation",
    icon: <BarChart3Icon className="size-4" />,
  },
  {
    id: "projects",
    name: "Projects",
    keywords: "projects folders proyectos",
    section: "Navigation",
    icon: <FolderIcon className="size-4" />,
  },
  {
    id: "docs",
    name: "Documentation",
    shortcut: ["g", "o"],
    keywords: "docs documentation documentación",
    section: "Navigation",
    icon: <FileTextIcon className="size-4" />,
  },
  {
    id: "settings",
    name: "Settings",
    shortcut: ["g", "s"],
    keywords: "settings preferences ajustes",
    section: "Settings",
    icon: <SettingsIcon className="size-4" />,
  },
  {
    id: "team",
    name: "Team Members",
    keywords: "team users members equipo",
    section: "Settings",
    icon: <UsersIcon className="size-4" />,
  },
]

// ————————————————————————————————————————
// Constants
// ————————————————————————————————————————

const MAX_RESULTS = 5
// ResultItem: h-10 = 40px fixed, enforced via className
// List container: py-2 = 16px top+bottom
const SLOT_HEIGHT = 40
const CONTAINER_PADDING = 16
const FIXED_HEIGHT = MAX_RESULTS * SLOT_HEIGHT + CONTAINER_PADDING // 216px

// ————————————————————————————————————————
// Helpers
// ————————————————————————————————————————

function isTypingContext(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  )
}

function filterActions(actions: SearchAction[], query: string): SearchAction[] {
  if (!query.trim()) return actions
  const q = query.toLowerCase()
  return actions.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.keywords?.toLowerCase().includes(q) ||
      a.subtitle?.toLowerCase().includes(q) ||
      a.section?.toLowerCase().includes(q)
  )
}

// ————————————————————————————————————————
// Kbd
// ————————————————————————————————————————

function Kbd({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <kbd
      className={cn(
        "flex h-5 items-center rounded border border-border bg-muted px-1.5",
        "font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  )
}

// ————————————————————————————————————————
// ResultItem
// ————————————————————————————————————————

interface ResultItemProps {
  action: SearchAction
  active: boolean
  onSelect: (action: SearchAction) => void
}

function ResultItem({ action, active, onSelect }: ResultItemProps) {
  return (
    <div
      role="option"
      aria-selected={active}
      onClick={() => onSelect(action)}
      // h-10 = 40px, matches SLOT_HEIGHT constant
      className={cn(
        "mx-2 flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm transition-colors duration-100",
        active
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-accent/50"
      )}
    >
      {action.icon && (
        <span className="shrink-0 text-muted-foreground">{action.icon}</span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate leading-none font-medium">{action.name}</span>
        {action.subtitle && (
          <span className="mt-0.5 truncate text-xs text-muted-foreground">
            {action.subtitle}
          </span>
        )}
      </div>
      {action.shortcut?.length ? (
        <div className="flex shrink-0 items-center gap-1">
          {action.shortcut.map((sc, i) => (
            <Kbd key={sc + i}>{sc}</Kbd>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ————————————————————————————————————————
// useSearchMenu — shared stateful logic
// ————————————————————————————————————————

function useSearchMenu(actions: SearchAction[]) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const flatList = filterActions(actions, query).slice(0, MAX_RESULTS)

  const open = React.useCallback(() => {
    setIsOpen(true)
    setQuery("")
    setActiveIndex(0)
    setTimeout(() => inputRef.current?.focus(), 10)
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setActiveIndex(0)
    inputRef.current?.blur()
  }, [])

  const handleSelect = React.useCallback(
    (action: SearchAction) => {
      action.perform?.()
      close()
    },
    [close]
  )

  // F → open
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        (e.key === "f" || e.key === "F") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTypingContext(e)
      ) {
        e.preventDefault()
        e.stopPropagation()
        open()
      }
    }
    document.addEventListener("keydown", h, { capture: true })
    return () => document.removeEventListener("keydown", h, { capture: true })
  }, [open])

  // Arrow / Enter / Escape
  React.useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        close()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flatList.length - 1))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const s = flatList[activeIndex]
        if (s) handleSelect(s)
        return
      }
    }
    document.addEventListener("keydown", h, { capture: true })
    return () => document.removeEventListener("keydown", h, { capture: true })
  }, [isOpen, activeIndex, flatList, close, handleSelect])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleContainerBlur = (e: React.FocusEvent) => {
    const rel = e.relatedTarget as HTMLElement | null
    if (rel && containerRef.current?.contains(rel)) return
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) close()
    }, 150)
  }

  const renderList = () => {
    if (flatList.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No results found.
        </div>
      )
    }
    return flatList.map((action, idx) => (
      <ResultItem
        key={action.id}
        action={action}
        active={idx === activeIndex}
        onSelect={handleSelect}
      />
    ))
  }

  return {
    isOpen,
    query,
    setQuery,
    containerRef,
    inputRef,
    open,
    close,
    handleContainerBlur,
    renderList,
  }
}

// ————————————————————————————————————————
// SearchMenu
// ————————————————————————————————————————

export function SearchMenu({
  variant = "sidebar",
  placeholder = "Search...",
  className,
  actions = defaultActions,
  onFocus,
}: SearchMenuProps) {
  const {
    isOpen,
    query,
    setQuery,
    containerRef,
    inputRef,
    open,
    close,
    handleContainerBlur,
    renderList,
  } = useSearchMenu(actions)

  // Wrap open to also call the external onFocus callback
  const handleOpen = React.useCallback(() => {
    open()
    onFocus?.()
  }, [open, onFocus])

  // ——— Dock ———
  if (variant === "dock") {
    return (
      <div
        ref={containerRef}
        onBlur={handleContainerBlur}
        className={cn("relative", className)}
      >
        {/* Dropdown anchored upward, left-aligned with the input */}
        <div
          className={cn(
            "fixed bottom-14 left-1/2 z-50 w-80 -translate-x-1/2",
            "rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl",
            "origin-bottom transition-all duration-200 ease-out",
            isOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0"
          )}
        >
          <div
            className="overflow-hidden py-2"
            role="listbox"
            style={{ height: FIXED_HEIGHT }}
          >
            {renderList()}
          </div>
        </div>

        {/* Inline input — always visible inside the dock pill */}
        <div
          className={cn(
            "flex h-8 items-center gap-2 rounded-full px-3",
            "transition-colors duration-150",
            isOpen
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <SearchIcon className="size-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleOpen}
            placeholder={placeholder}
            className="w-14 bg-transparent text-sm transition-all duration-200 placeholder:text-muted-foreground focus:w-32 focus:outline-none"
          />
        </div>
      </div>
    )
  }

  // ——— Sidebar ———
  return (
    <div
      ref={containerRef}
      onBlur={handleContainerBlur}
      className={cn("relative w-full", className)}
    >
      <div
        className={cn(
          "absolute left-0 z-50",
          "rounded-xl border border-transparent bg-secondary/50",
          "transition-all duration-200 ease-out",
          isOpen
            ? "w-80 border-ring bg-popover shadow-lg ring-1 ring-ring/10"
            : "w-full hover:border-border hover:bg-secondary"
        )}
      >
        {/* Input row */}
        <div className="flex h-10 items-center gap-2 px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={open}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <Kbd>{isOpen ? "Esc" : "F"}</Kbd>
        </div>

        {/* List — inline, sin separación */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-out",
            isOpen ? "opacity-100" : "pointer-events-none h-0 opacity-0"
          )}
          role="listbox"
          style={isOpen ? { height: FIXED_HEIGHT } : undefined}
        >
          <div className="py-2">{renderList()}</div>
        </div>
      </div>

      {/* Spacer para que el layout no colapse al ser absolute */}
      <div className="h-9" />
    </div>
  )
}

export { defaultActions, type SearchAction as Action }
