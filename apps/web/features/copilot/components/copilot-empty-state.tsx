"use client"

import { type ReactNode } from "react"

import { useCopilotChat } from "@workspace/web/features/copilot/copilot-chat-provider"

export function CopilotEmptyState({ children }: { children: ReactNode }) {
  const { hasMessages } = useCopilotChat()

  if (hasMessages) return null

  return <>{children}</>
}
