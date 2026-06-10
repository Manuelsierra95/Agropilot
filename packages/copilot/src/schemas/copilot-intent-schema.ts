import { z } from "zod"

import { actionIntentSchema } from "./action-schema"
import { querySpecSchema } from "./copilot-queries"
import { dashboardCellsSchema } from "./dashboard-grid-schema"
import { widgetSpecSchema } from "./widget-schema"

export const COPILOT_REFERENCE_DATE = "2026-06-08"

export const COPILOT_OUT_OF_SCOPE_MESSAGE =
  "No puedo ayudar con esa consulta. Puedo ayudarte con temas relacionados con gestión agrícola, parcelas, cultivos o datos de tu explotación."

export const answerFocusSchema = z.enum(["today", "latest", "range"])

export const presentationChannelSchema = z.enum(["chat", "dashboard"])

export type PresentationChannel = z.infer<typeof presentationChannelSchema>

export const chatIntentSchema = z.object({
  intent: z.literal("chat"),
  message: z.string().min(1),
})

export const outOfScopeIntentSchema = z.object({
  intent: z.literal("out_of_scope"),
})

export const answerIntentSchema = z.object({
  intent: z.literal("answer"),
  queries: z.array(querySpecSchema).min(1).max(3),
  focus: answerFocusSchema.optional(),
})

export const chartIntentSchema = z.object({
  intent: z.literal("chart"),
  title: z.string().min(1),
  queries: z.array(querySpecSchema).min(1).max(5),
})

export const dataIntentSchema = z.object({
  intent: z.literal("data"),
  message: z.string(),
  queries: z.array(querySpecSchema).min(1).max(5),
  presentation: presentationChannelSchema.optional(),
  widgets: z.array(widgetSpecSchema).min(0).max(3),
  focus: answerFocusSchema.optional(),
})

export const dashboardIntentSchema = z.object({
  intent: z.literal("dashboard"),
  message: z.string(),
  queries: z.array(querySpecSchema).min(1).max(6),
  cells: dashboardCellsSchema,
  focus: answerFocusSchema.optional(),
})

export const copilotIntentSchema = z.union([
  chatIntentSchema,
  outOfScopeIntentSchema,
  answerIntentSchema,
  chartIntentSchema,
  dataIntentSchema,
  dashboardIntentSchema,
  actionIntentSchema,
])

export type AnswerFocus = z.infer<typeof answerFocusSchema>
export type ChatIntent = z.infer<typeof chatIntentSchema>
export type OutOfScopeIntent = z.infer<typeof outOfScopeIntentSchema>
export type AnswerIntent = z.infer<typeof answerIntentSchema>
export type ChartIntent = z.infer<typeof chartIntentSchema>
export type DataIntent = z.infer<typeof dataIntentSchema>
export type DashboardIntent = z.infer<typeof dashboardIntentSchema>
export type ActionIntent = z.infer<typeof actionIntentSchema>
export type CopilotIntent = z.infer<typeof copilotIntentSchema>

export type CopilotResolveReason = "invalid_intent" | "llm_error"

export type CopilotIntentResult =
  | { ok: true; intent: CopilotIntent }
  | { ok: false; reason: CopilotResolveReason }

export function normalizeAnswerFocus(
  focus: AnswerFocus | undefined
): AnswerFocus {
  return focus ?? "today"
}

export function answerIntentToData(intent: AnswerIntent): DataIntent {
  return {
    intent: "data",
    message: "",
    queries: intent.queries,
    presentation: "chat",
    widgets: [],
    focus: normalizeAnswerFocus(intent.focus),
  }
}

export function chartIntentToData(intent: ChartIntent): DataIntent {
  return {
    intent: "data",
    message: "",
    queries: intent.queries,
    presentation: "dashboard",
    widgets: [{ type: "line_chart", title: intent.title }],
  }
}

export function normalizeToDataIntent(intent: CopilotIntent): DataIntent | null {
  if (intent.intent === "data") {
    return {
      ...intent,
      focus: normalizeAnswerFocus(intent.focus),
    }
  }
  if (intent.intent === "answer") {
    return answerIntentToData(intent)
  }
  if (intent.intent === "chart") {
    return chartIntentToData(intent)
  }
  return null
}
