import { convertToModelMessages, generateObject, generateText, type UIMessage } from "ai"

import {
  type CopilotIntent,
  type CopilotIntentResult,
  copilotIntentSchema,
  COPILOT_REFERENCE_DATE,
  normalizeAnswerFocus,
} from "../schemas/copilot-intent-schema"
import type { QuerySpec } from "../schemas/chart-action-schema"
import { COPILOT_INTENT_SYSTEM_PROMPT } from "../prompts/dashboard-system-prompt"
import { getLastUserText } from "./get-last-user-text"
import { getChatModel } from "../model/get-model"
import {
  extractJsonFromText,
  normalizeQueriesInObject,
} from "./normalize-query-input"
import { recoverIntentFromProse } from "./copilot-scope"

const LOG_PREFIX = "[resolve-copilot-intent]"

function parseCopilotIntent(input: unknown): CopilotIntentResult {
  const normalized = normalizeQueriesInObject(input)
  console.log(`${LOG_PREFIX} normalized input`, JSON.stringify(normalized, null, 2))

  const parsed = copilotIntentSchema.safeParse(normalized)
  if (parsed.success) {
    const intent = parsed.data
    if (intent.intent === "answer") {
      return {
        ok: true,
        intent: { ...intent, focus: normalizeAnswerFocus(intent.focus) },
      }
    }
    if (intent.intent === "data") {
      return {
        ok: true,
        intent: { ...intent, focus: normalizeAnswerFocus(intent.focus) },
      }
    }
    console.log(`${LOG_PREFIX} success`, intent)
    return { ok: true, intent }
  }

  console.error(
    `${LOG_PREFIX} zod validation failed`,
    JSON.stringify(parsed.error.flatten(), null, 2)
  )
  return { ok: false, reason: "invalid_intent" }
}

function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00Z`).getTime()
  const end = new Date(`${to}T00:00:00Z`).getTime()
  return Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24))
}

function reclassifyToPointInTimeData(queries: QuerySpec[]): CopilotIntent {
  return {
    intent: "data",
    message: "",
    focus: "today",
    queries: queries.map((query) => ({
      ...query,
      from: COPILOT_REFERENCE_DATE,
      to: COPILOT_REFERENCE_DATE,
    })),
    presentation: "chat",
    widgets: [],
  }
}

function maybeReclassifyChartToAnswer(
  userText: string,
  intent: CopilotIntent
): CopilotIntent {
  const isPointInTime = /\b(hoy|ahora|actual)\b/i.test(userText)
  if (!isPointInTime) return intent

  if (intent.intent === "chart") {
    const spansDays = intent.queries.map((query) =>
      daysBetween(query.from, query.to)
    )
    const maxSpan = Math.max(...spansDays, 0)
    if (maxSpan <= 3) return intent

    console.log(`${LOG_PREFIX} reclassified chart → data/chat (point-in-time)`)
    return reclassifyToPointInTimeData(intent.queries)
  }

  if (intent.intent === "data") {
    const hasChartWidget = intent.widgets.some(
      (w) => w.type === "line_chart" || w.type === "bar_chart"
    )
    if (!hasChartWidget) return intent

    const spansDays = intent.queries.map((query) =>
      daysBetween(query.from, query.to)
    )
    const maxSpan = Math.max(...spansDays, 0)
    if (maxSpan <= 3) return intent

    console.log(`${LOG_PREFIX} reclassified data/chart → data/chat (point-in-time)`)
    return reclassifyToPointInTimeData(intent.queries)
  }

  return intent
}

async function resolveFromTextFallback(text: string): Promise<CopilotIntentResult> {
  const json = extractJsonFromText(text)
  if (json) {
    return parseCopilotIntent(json)
  }

  const recovered = recoverIntentFromProse(text)
  if (recovered.ok) {
    console.log(`${LOG_PREFIX} recovered intent from prose`, recovered.intent.intent)
  }
  return recovered
}

export async function resolveCopilotIntent(
  messages: UIMessage[]
): Promise<CopilotIntentResult> {
  const userText = getLastUserText(messages)
  console.log(`${LOG_PREFIX} userText`, userText)

  try {
    const { object } = await generateObject({
      model: getChatModel(),
      schema: copilotIntentSchema,
      system: COPILOT_INTENT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 768,
    })

    console.log(`${LOG_PREFIX} generateObject finished`, object)

    const parsed = parseCopilotIntent(object)
    if (!parsed.ok) return parsed

    return {
      ok: true,
      intent: maybeReclassifyChartToAnswer(userText, parsed.intent),
    }
  } catch (objectError) {
    console.warn(`${LOG_PREFIX} generateObject failed, trying text fallback`, objectError)

    try {
      const result = await generateText({
        model: getChatModel(),
        system: `${COPILOT_INTENT_SYSTEM_PROMPT}\n\nResponde SOLO con el objeto JSON del modo correcto.`,
        messages: await convertToModelMessages(messages),
        maxOutputTokens: 768,
      })

      console.log(`${LOG_PREFIX} generateText fallback`, {
        textLength: result.text.length,
        textPreview: result.text.slice(0, 200),
      })

      const fallback = await resolveFromTextFallback(result.text)
      if (!fallback.ok) return fallback

      return {
        ok: true,
        intent: maybeReclassifyChartToAnswer(userText, fallback.intent),
      }
    } catch (textError) {
      console.error(`${LOG_PREFIX} generateText fallback failed`, textError)
      return { ok: false, reason: "llm_error" }
    }
  }
}
