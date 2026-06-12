import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai"

import { getChatModel } from "../model/get-model"
import { loadSystemPrompt } from "../prompts/load-system-prompt"
import { createCopilotTools } from "../tools/copilot-tools"
import type { CopilotContext, ExecuteQueryFn } from "../types/execute-query"

export type StreamCopilotDeps = {
  executeQuery: ExecuteQueryFn
  ctx: CopilotContext
}

export async function streamCopilotResponse(
  messages: UIMessage[],
  deps: StreamCopilotDeps
): Promise<Response> {
  const { executeQuery, ctx } = deps
  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: getChatModel(),
    system: loadSystemPrompt(ctx),
    messages: modelMessages,
    tools: createCopilotTools(executeQuery, ctx),
    stopWhen: stepCountIs(5),
    onStepFinish: ({ finishReason, toolCalls, toolResults, text }) => {
      console.log("[copilot/chat] step", {
        finishReason,
        toolCalls: toolCalls?.map((call) => ({
          toolName: call.toolName,
          input: call.input,
        })),
        toolResults: toolResults?.map((result) => ({
          toolName: result.toolName,
          output: result.output,
        })),
        textLength: text.length,
      })
    },
    onFinish: ({ finishReason, usage, steps }) => {
      console.log("[copilot/chat] finish", {
        finishReason,
        usage,
        stepCount: steps.length,
      })
    },
    onError: (error) => {
      console.error("[copilot/chat] error", error)
    },
  })

  return result.toUIMessageStreamResponse()
}
