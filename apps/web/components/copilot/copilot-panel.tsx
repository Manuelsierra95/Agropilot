import { AgroCopilotMessages } from "@/features/copilot/agro-copilot-messages"
import { CopilotChatProvider } from "@/features/copilot/copilot-chat-provider"
import { ChatInput } from "@/features/copilot/components/chat-input"
import { CopilotRecommendations } from "@/features/copilot/components/copilot-recommendations"

export function CopilotPanel() {
  return (
    <CopilotChatProvider>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-sidebar">
        <AgroCopilotMessages />
        <CopilotRecommendations />
        <ChatInput />
      </div>
    </CopilotChatProvider>
  )
}
