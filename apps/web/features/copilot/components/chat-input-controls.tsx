"use client"

import { Loader2, Send, Square } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"

import { useCopilotChat } from "@/features/copilot/copilot-chat-provider"

export function ChatInputControls({
  placeholder = "Pregunta lo que quieras",
}: {
  placeholder?: string
}) {
  const { input, setInput, handleSubmit, stop, isLoading } = useCopilotChat()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (!isLoading && input.trim()) handleSubmit()
    }
  }

  return (
    <>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        className="min-h-[44px] resize-none"
        disabled={isLoading}
      />
      {isLoading ? (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={stop}
          aria-label="Detener"
        >
          <Square className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          onClick={handleSubmit}
          disabled={!input.trim()}
          aria-label="Enviar"
        >
          <Send className="size-4" />
        </Button>
      )}
      {isLoading && (
        <Loader2 className="mb-2 size-4 shrink-0 animate-spin text-muted-foreground" />
      )}
    </>
  )
}
