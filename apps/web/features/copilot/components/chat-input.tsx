import { ChatInputControls } from "./chat-input-controls"

export function ChatInput({
  placeholder,
}: {
  placeholder?: string
}) {
  return (
    <div className="flex items-end gap-2 border-t border-sidebar-border bg-sidebar p-3">
      <ChatInputControls placeholder={placeholder} />
    </div>
  )
}
