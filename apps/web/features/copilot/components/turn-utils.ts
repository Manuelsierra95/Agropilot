import type { UIMessage } from "ai"

export type ChatTurn = {
  user: UIMessage
  assistant?: UIMessage
}

export function groupTurns(messages: UIMessage[]): ChatTurn[] {
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

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}
