"use client"

import type { UIMessage } from "ai"
import { cn } from "@workspace/ui/lib/utils"

import { AssistantMessage } from "./assistant-message"
import { type ChatTurn, getMessageText } from "./turn-utils"

function HistoryUserBubble({ message }: { message: UIMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[90%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
        {getMessageText(message)}
      </div>
    </div>
  )
}

interface MessageHistoryProps {
  turns: ChatTurn[]
  className?: string
}

export function MessageHistory({ turns, className }: MessageHistoryProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {turns.length > 0 ? (
        <div className="flex flex-col gap-4 p-4">
          {turns.map((turn) => (
            <div key={turn.user.id} className="flex flex-col gap-2">
              <HistoryUserBubble message={turn.user} />
              {turn.assistant ? (
                <AssistantMessage
                  message={turn.assistant}
                  isStreaming={false}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
