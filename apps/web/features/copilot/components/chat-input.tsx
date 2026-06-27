import { ChatInputControls } from "./chat-input-controls"

export function ChatInput({ placeholder }: { placeholder?: string }) {
  return (
    <div className="bg-sidebar p-3">
      <ChatInputControls placeholder={placeholder} />
    </div>
  )
}
