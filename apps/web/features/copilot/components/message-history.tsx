"use client"

import type { UIMessage } from "ai"

import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@workspace/ui/components/message"
import { MessageScrollerItem } from "@workspace/ui/components/message-scroller"

import { AssistantMessage } from "@workspace/web/features/copilot/components/assistant-message"
import { type ChatTurn, getMessageText } from "@workspace/web/features/copilot/components/turn-utils"

function HistoryUserBubble({ message }: { message: UIMessage }) {
  const text = getMessageText(message)
  return (
    <Message align="end">
      <MessageContent>
        <Bubble variant="default" align="end">
          <BubbleContent>{text}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

interface MessageHistoryProps {
  turns: ChatTurn[]
  className?: string
}

export function MessageHistory({ turns, className }: MessageHistoryProps) {
  if (turns.length === 0) return null

  return (
    <div className={className}>
      {turns.map((turn) => (
        <MessageScrollerItem key={turn.user.id} messageId={turn.user.id}>
          <div className="space-y-3 px-4 py-3">
            <HistoryUserBubble message={turn.user} />
            {turn.assistant ? (
              <AssistantMessage
                message={turn.assistant}
                isStreaming={false}
              />
            ) : null}
          </div>
        </MessageScrollerItem>
      ))}
    </div>
  )
}
