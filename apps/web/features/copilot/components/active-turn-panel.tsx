"use client"

import type { CopilotActionPayload } from "@workspace/copilot"
import type { ActionLocalState } from "@workspace/copilot"
import {
  createPendingTaskProgress,
  getActionConfirmations,
  getLatestTaskProgress,
} from "@workspace/copilot"

import { ActionConfirmationCard } from "./action-confirmation-card"
import { TaskProgressCard } from "./task-progress-card"
import { type ChatTurn, getMessageText, resolveActionState } from "./turn-utils"

interface ActiveTurnPanelProps {
  turn: ChatTurn
  isStreaming: boolean
  actionStates: Record<string, ActionLocalState>
  onActionDataChange: (
    id: string,
    action: ActionLocalState["action"],
    data: CopilotActionPayload,
    status: ActionLocalState["status"]
  ) => void
  onActionConfirm: (
    id: string,
    action: ActionLocalState["action"],
    data: CopilotActionPayload
  ) => void
  onActionCancel: (
    id: string,
    action: ActionLocalState["action"],
    data: CopilotActionPayload
  ) => void
}

export function ActiveTurnPanel({
  turn,
  isStreaming,
  actionStates,
  onActionDataChange,
  onActionConfirm,
  onActionCancel,
}: ActiveTurnPanelProps) {
  const pendingProgress = createPendingTaskProgress()
  const message = turn.assistant
  const text = message ? getMessageText(message) : ""
  const progress = message
    ? getLatestTaskProgress(message)
    : isStreaming
      ? pendingProgress
      : null
  const confirmations = message ? getActionConfirmations(message) : []

  if (!message && !isStreaming) return null
  if (message && !text && !progress && confirmations.length === 0) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {progress ? (
        <TaskProgressCard progress={progress} isStreaming={isStreaming} />
      ) : null}
      {text ? (
        <div className="max-w-[90%] rounded-2xl border bg-muted/50 px-4 py-2 text-sm whitespace-pre-wrap text-foreground">
          {text}
        </div>
      ) : null}
      {confirmations.map((confirmation) => {
        const localState = resolveActionState(confirmation, actionStates)
        return (
          <ActionConfirmationCard
            key={confirmation.id}
            confirmation={confirmation}
            editedData={localState.data}
            status={localState.status}
            onDataChange={(data) =>
              onActionDataChange(
                confirmation.id,
                localState.action,
                data,
                localState.status
              )
            }
            onConfirm={() =>
              onActionConfirm(
                confirmation.id,
                localState.action,
                localState.data
              )
            }
            onCancel={() =>
              onActionCancel(
                confirmation.id,
                localState.action,
                localState.data
              )
            }
          />
        )
      })}
    </div>
  )
}
