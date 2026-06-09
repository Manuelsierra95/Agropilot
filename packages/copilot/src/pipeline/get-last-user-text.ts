export function getLastUserText(
  messages: { role: string; parts: { type: string; text?: string }[] }[]
): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message?.role !== "user") continue
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
  }
  return ""
}
