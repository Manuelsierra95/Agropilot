"use client"

import { AgroCopilotMessages } from "@/features/copilot/agro-copilot-messages"
import { ChatInput } from "@/features/copilot/components/chat-input"
import { CopilotHeader } from "@/features/copilot/components/copilot-header"
import { CopilotRecommendations } from "@/features/copilot/components/copilot-recommendations"

export function CopilotPanel() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-sidebar">
      <CopilotHeader />
      <AgroCopilotMessages />
      <CopilotRecommendations />
      <ChatInput />
    </div>
  )
}
