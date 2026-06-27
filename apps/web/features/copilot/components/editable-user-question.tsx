"use client"

import { useRef, useState } from "react"
import { Pencil, Send, X } from "lucide-react"

import type { UIMessage } from "ai"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@workspace/ui/components/message"
import { cn } from "@workspace/ui/lib/utils"

import { getMessageText } from "./turn-utils"

interface EditableUserQuestionProps {
  message: UIMessage
  isDisabled: boolean
  onEditSubmit: (correctedText: string) => void
}

export function EditableUserQuestion({
  message,
  isDisabled,
  onEditSubmit,
}: EditableUserQuestionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const text = getMessageText(message)

  const handleEditStart = () => {
    if (isDisabled) return
    setEditText(text)
    setIsEditing(true)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditText("")
  }

  const handleSubmit = () => {
    const trimmed = editText.trim()
    if (!trimmed) {
      handleCancel()
      return
    }
    setIsEditing(false)
    setEditText("")
    onEditSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="min-h-[44px] resize-none bg-transparent text-sm focus:ring-0 focus-visible:ring-0"
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            <X className="mr-1 size-3" />
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!editText.trim()}
            onClick={handleSubmit}
          >
            <Send className="mr-1 size-3" />
            Enviar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Message align="end">
      <MessageContent className="flex flex-row items-end justify-end gap-1">
        <Bubble variant="default" align="end">
          <BubbleContent>{text}</BubbleContent>
        </Bubble>
        <MessageFooter>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-6 opacity-0 transition-opacity group-hover/message:opacity-100",
              isDisabled && "pointer-events-none"
            )}
            disabled={isDisabled}
            onClick={handleEditStart}
            aria-label="Editar pregunta"
          >
            <Pencil className="size-3" />
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}
