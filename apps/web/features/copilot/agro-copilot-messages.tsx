"use client"

import { useCopilotChat } from "@workspace/web/features/copilot/copilot-chat-provider"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller"

import { ActiveTurnPanel } from "@workspace/web/features/copilot/components/active-turn-panel"
import { EditableUserQuestion } from "@workspace/web/features/copilot/components/editable-user-question"
import { MessageHistory } from "@workspace/web/features/copilot/components/message-history"
import { groupTurns } from "@workspace/web/features/copilot/components/turn-utils"

export function AgroCopilotMessages() {
  const { messages, isLoading, handleEditSubmit, hasMessages } =
    useCopilotChat()

  const turns = groupTurns(messages)
  const historyTurns = turns.length > 1 ? turns.slice(0, -1) : []
  const activeTurn = turns.at(-1)

  if (!hasMessages) return null

  return (
    <MessageScrollerProvider
      autoScroll
      defaultScrollPosition="last-anchor"
      scrollPreviousItemPeek={64}
    >
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <MessageHistory turns={historyTurns} />

            {activeTurn ? (
              <MessageScrollerItem messageId={activeTurn.user.id} scrollAnchor>
                <div className="space-y-3 px-4 py-3">
                  <EditableUserQuestion
                    message={activeTurn.user}
                    isDisabled={isLoading}
                    onEditSubmit={handleEditSubmit}
                  />
                  <ActiveTurnPanel turn={activeTurn} isStreaming={isLoading} />
                </div>
              </MessageScrollerItem>
            ) : null}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
