"use client"

import type { CopilotActionPayload } from "@workspace/copilot"
import type { ActionLocalState, AgroCopilotUIMessage } from "@workspace/copilot"
import {
  getActionConfirmations,
  getLatestTaskProgress,
} from "@workspace/copilot"
import { cn } from "@workspace/ui/lib/utils"

import { ActionConfirmationCard } from "./action-confirmation-card"
import { TaskProgressCard } from "./task-progress-card"
import { type ChatTurn, getMessageText, resolveActionState } from "./turn-utils"

function HistoryUserBubble({ message }: { message: AgroCopilotUIMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[90%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
        {getMessageText(message)}
      </div>
    </div>
  )
}

function HistoryAssistantBlock({
  message,
  actionStates,
  onActionDataChange,
  onActionConfirm,
  onActionCancel,
}: {
  message: AgroCopilotUIMessage
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
}) {
  const text = getMessageText(message)
  const progress = getLatestTaskProgress(message)
  const confirmations = getActionConfirmations(message)

  if (!text && !progress && confirmations.length === 0) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {progress ? (
        <TaskProgressCard progress={progress} isStreaming={false} />
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

interface MessageHistoryProps {
  turns: ChatTurn[]
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
  className?: string
}

export function MessageHistory({
  turns,
  actionStates,
  onActionDataChange,
  onActionConfirm,
  onActionCancel,
  className,
}: MessageHistoryProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {turns.length > 0 ? (
        <div className="flex flex-col gap-4 p-4">
          {turns.map((turn) => (
            <div key={turn.user.id} className="flex flex-col gap-2">
              <HistoryUserBubble message={turn.user} />
              {turn.assistant ? (
                <HistoryAssistantBlock
                  message={turn.assistant}
                  actionStates={actionStates}
                  onActionDataChange={onActionDataChange}
                  onActionConfirm={onActionConfirm}
                  onActionCancel={onActionCancel}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
