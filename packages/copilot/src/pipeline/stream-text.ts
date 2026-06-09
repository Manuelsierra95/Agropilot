type TextStreamChunk = {
  type: string
  id?: string
  delta?: string
}

type TextStreamWriter = {
  write: (chunk: TextStreamChunk) => void
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

export function streamAssistantText(
  writer: TextStreamWriter,
  text: string,
  textId = "assistant-text"
) {
  writer.write({ type: "text-start", id: textId })

  for (const delta of chunkText(text, 24)) {
    writer.write({ type: "text-delta", id: textId, delta })
  }

  writer.write({ type: "text-end", id: textId })
}

export function asTextStreamWriter(writer: object): TextStreamWriter {
  return writer as TextStreamWriter
}
