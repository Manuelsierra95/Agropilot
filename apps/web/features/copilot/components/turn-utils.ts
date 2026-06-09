import type {
  ActionConfirmationData,
  ActionLocalState,
  AgroCopilotUIMessage,
  CopilotActionPayload,
} from "@workspace/copilot"

export type ChatTurn = {
  user: AgroCopilotUIMessage
  assistant?: AgroCopilotUIMessage
}

export function groupTurns(messages: AgroCopilotUIMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = []

  for (let index = 0; index < messages.length; index++) {
    const message = messages[index]
    if (message?.role !== "user") continue

    const next = messages[index + 1]
    const assistant = next?.role === "assistant" ? next : undefined
    turns.push({ user: message, assistant })
    if (assistant) index++
  }

  return turns
}

export function getMessageText(message: AgroCopilotUIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function resolveActionState(
  confirmation: ActionConfirmationData,
  actionStates: Record<string, ActionLocalState>
): ActionLocalState {
  return (
    actionStates[confirmation.id] ?? {
      action: confirmation.action,
      data: confirmation.data as CopilotActionPayload,
      status: confirmation.status,
    }
  )
}
