"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useSidebar } from "@workspace/ui/components/sidebar"

type CopilotLayoutContextValue = {
  isFullscreen: boolean
  toggleFullscreen: () => void
  closeCopilot: () => void
}

const CopilotLayoutContext = createContext<CopilotLayoutContextValue | null>(
  null
)

export function CopilotLayoutProvider({ children }: { children: ReactNode }) {
  const { setOpen } = useSidebar()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((current) => !current)
  }, [])

  const closeCopilot = useCallback(() => {
    setIsFullscreen(false)
    setOpen(false)
  }, [setOpen])

  const value = useMemo(
    () => ({ isFullscreen, toggleFullscreen, closeCopilot }),
    [isFullscreen, toggleFullscreen, closeCopilot]
  )

  return <CopilotLayoutContext value={value}>{children}</CopilotLayoutContext>
}

export function useCopilotLayout() {
  const context = useContext(CopilotLayoutContext)
  if (!context) {
    throw new Error(
      "useCopilotLayout must be used within CopilotLayoutProvider"
    )
  }
  return context
}
