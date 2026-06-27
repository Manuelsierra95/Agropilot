import { ChatInputControls } from "./chat-input-controls"

export function ChatInput({ placeholder }: { placeholder?: string }) {
  return (
    <div className="border-t border-sidebar-border bg-sidebar p-3">
      <ChatInputControls placeholder={placeholder} />
    </div>
  )
}
