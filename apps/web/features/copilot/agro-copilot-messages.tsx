"use client"

import { useLayoutEffect, useRef } from "react"

import { useCopilotChat } from "@/features/copilot/copilot-chat-provider"

import { ActiveTurnPanel } from "./components/active-turn-panel"
import { EditableUserQuestion } from "./components/editable-user-question"
import { MessageHistory } from "./components/message-history"
import { groupTurns } from "./components/turn-utils"

export function AgroCopilotMessages() {
  const {
    messages,
    isLoading,
    actionStates,
    handleActionDataChange,
    handleActionConfirm,
    handleActionCancel,
    handleEditSubmit,
    hasMessages,
  } = useCopilotChat()

  const scrollRef = useRef<HTMLDivElement>(null)
  const activeTurnRef = useRef<HTMLDivElement>(null)
  const lastActiveTurnIdRef = useRef<string | undefined>(undefined)

  const turns = groupTurns(messages)
  const historyTurns = turns.length > 1 ? turns.slice(0, -1) : []
  const activeTurn = turns.at(-1)

  useLayoutEffect(() => {
    const newId = activeTurn?.user.id
    if (!newId || newId === lastActiveTurnIdRef.current) return
    lastActiveTurnIdRef.current = newId

    const scrollToAnchor = () => {
      const container = scrollRef.current
      const anchor = activeTurnRef.current
      if (!container || !anchor) return
      const containerRect = container.getBoundingClientRect()
      const anchorRect = anchor.getBoundingClientRect()
      container.scrollTop =
        container.scrollTop + (anchorRect.top - containerRect.top)
    }

    scrollToAnchor()
    requestAnimationFrame(scrollToAnchor)
  }, [activeTurn?.user.id])

  if (!hasMessages) return null

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
    >
      <MessageHistory
        turns={historyTurns}
        actionStates={actionStates}
        onActionDataChange={handleActionDataChange}
        onActionConfirm={handleActionConfirm}
        onActionCancel={handleActionCancel}
      />

      <div
        ref={activeTurnRef}
        className="min-h-full shrink-0 space-y-3 px-4 py-3"
      >
        {activeTurn ? (
          <EditableUserQuestion
            message={activeTurn.user}
            isDisabled={isLoading}
            onEditSubmit={handleEditSubmit}
          />
        ) : null}
        {activeTurn ? (
          <ActiveTurnPanel
            turn={activeTurn}
            isStreaming={isLoading}
            actionStates={actionStates}
            onActionDataChange={handleActionDataChange}
            onActionConfirm={handleActionConfirm}
            onActionCancel={handleActionCancel}
          />
        ) : null}
      </div>
    </div>
  )
}
