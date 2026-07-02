"use client"

import { taskCreateInputSchema } from "@workspace/schemas"
import type { UIMessage } from "ai"
import { Check } from "lucide-react"
import { useState } from "react"

import { useCopilotLayout } from "@workspace/web/features/copilot/copilot-layout-context"
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import { Message, MessageContent } from "@workspace/ui/components/message"
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@workspace/ui/components/marker"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { TaskFormCard } from "@workspace/web/features/copilot/components/task-form-card"

export interface AssistantMessageProps {
  message: UIMessage
  isStreaming: boolean
  className?: string
}

type ToolPart = UIMessage["parts"][number] & {
  toolCallId: string
  state: string
}

type TaskFeedback =
  | { type: "success"; title: string }
  | { type: "error"; title: string }

function isToolPart(part: UIMessage["parts"][number]): part is ToolPart {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool"
}

function getToolName(part: UIMessage["parts"][number]): string {
  if (part.type === "dynamic-tool" && "toolName" in part) {
    return (part as { toolName: string }).toolName
  }
  return part.type.replace(/^tool-/, "")
}

function formatToolLabel(toolName: string): string {
  return toolName.replace(/^query_/, "").replaceAll("_", " ")
}

function isQueryTool(toolName: string): boolean {
  return toolName.startsWith("query_")
}

function readToolPayload(part: ToolPart): unknown {
  if ("output" in part && part.output !== undefined) {
    return part.output
  }
  if ("input" in part) {
    return part.input
  }
  return undefined
}

function parseTaskFormProposal(part: ToolPart) {
  const parsed = taskCreateInputSchema.safeParse(readToolPayload(part))
  return parsed.success ? parsed.data : null
}

function isToolDone(state: string) {
  return state === "output-available" || state === "output-error"
}

export function AssistantMessage({
  message,
  isStreaming,
  className,
}: AssistantMessageProps) {
  const { isFullscreen } = useCopilotLayout()
  const [taskFeedback, setTaskFeedback] = useState<TaskFeedback | null>(null)
  const [submittedFormIds, setSubmittedFormIds] = useState<Set<string>>(
    () => new Set()
  )

  const textContent = message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("")

  const toolParts = message.parts.filter(isToolPart)
  const queryToolParts = toolParts.filter((part) =>
    isQueryTool(getToolName(part))
  )
  const taskFormParts = toolParts.filter(
    (part) => getToolName(part) === "show_task_form"
  )

  if (
    !textContent &&
    queryToolParts.length === 0 &&
    taskFormParts.length === 0 &&
    !isStreaming &&
    !taskFeedback
  ) {
    return null
  }

  return (
    <Message align="start">
      <MessageContent
        className={cn(
          isFullscreen ? "mx-auto max-w-3xl" : "max-w-full",
          className
        )}
      >
        {queryToolParts.map((toolPart) => (
          <Marker key={toolPart.toolCallId} variant="border" role="status">
            <MarkerIcon>
              {isToolDone(toolPart.state) ? (
                <Check className="size-3.5 text-green-600" />
              ) : (
                <Spinner className="size-3.5" />
              )}
            </MarkerIcon>
            <MarkerContent>
              {isToolDone(toolPart.state) ? "Consultado" : "Consultando"}{" "}
              {formatToolLabel(getToolName(toolPart))}…
            </MarkerContent>
          </Marker>
        ))}

        {textContent ? (
          <Bubble variant="ghost" align="start">
            <BubbleContent>{textContent}</BubbleContent>
          </Bubble>
        ) : null}

        {taskFormParts.map((toolPart) => {
          const proposal = parseTaskFormProposal(toolPart)
          if (!proposal || submittedFormIds.has(toolPart.toolCallId)) {
            return null
          }

          return (
            <TaskFormCard
              key={toolPart.toolCallId}
              defaults={proposal}
              onSuccess={(title) => {
                setSubmittedFormIds((current) =>
                  new Set(current).add(toolPart.toolCallId)
                )
                setTaskFeedback({
                  type: "success",
                  title: `Tarea "${title}" creada correctamente.`,
                })
              }}
              onError={() => {
                setTaskFeedback({
                  type: "error",
                  title: "No se pudo crear la tarea. Inténtalo de nuevo.",
                })
              }}
            />
          )
        })}

        {taskFeedback ? (
          <div
            role="status"
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              taskFeedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                : "border-destructive/50 bg-destructive/10 text-destructive"
            )}
          >
            {taskFeedback.title}
          </div>
        ) : null}

        {isStreaming && !textContent && toolParts.length === 0 ? (
          <Marker role="status">
            <MarkerIcon>
              <Spinner className="size-3.5" />
            </MarkerIcon>
            <MarkerContent>Generando respuesta…</MarkerContent>
          </Marker>
        ) : null}
      </MessageContent>
    </Message>
  )
}
