"use client"

import type { UIMessage } from "ai"

import { AssistantMessage } from "./assistant-message"
import { TaskProgressCard } from "./task-progress-card"
import { type ChatTurn } from "./turn-utils"

interface ActiveTurnPanelProps {
  turn: ChatTurn
  isStreaming: boolean
}

export function ActiveTurnPanel({ turn, isStreaming }: ActiveTurnPanelProps) {
  const message = turn.assistant

  if (!message && !isStreaming) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {isStreaming && !message ? (
        <TaskProgressCard isStreaming />
      ) : null}
      {message ? (
        <AssistantMessage message={message} isStreaming={isStreaming} />
      ) : null}
    </div>
  )
}
