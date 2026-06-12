import type { CopilotChatRequest } from "@workspace/schemas"

export function getLastUserText(
  messages: CopilotChatRequest["messages"]
): string | undefined {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    if (message?.role !== "user") continue

    return message.parts
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("")
  }

  return undefined
}
