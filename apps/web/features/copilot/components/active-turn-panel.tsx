"use client"

import type { UIMessage } from "ai"

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@workspace/ui/components/marker"
import { Spinner } from "@workspace/ui/components/spinner"

import { AssistantMessage } from "./assistant-message"
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
        <Marker role="status">
          <MarkerIcon>
            <Spinner />
          </MarkerIcon>
          <MarkerContent>Agropilot está pensando…</MarkerContent>
        </Marker>
      ) : null}
      {message ? (
        <AssistantMessage message={message} isStreaming={isStreaming} />
      ) : null}
    </div>
  )
}
