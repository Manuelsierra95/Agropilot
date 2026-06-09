import type { UIMessage } from "ai"

import type { CopilotActionPayload, CopilotActionType } from "./action-schema"
import type { DashboardCellsPayload } from "./dashboard-grid-schema"
import type { Widget } from "./widget-schema"

export type ProcessStepStatus = "pending" | "running" | "done" | "skipped"

export type ProcessStep = {
  id: string
  label: string
  status: ProcessStepStatus
  badge?: string
}

export type TaskProgressPhase = "running" | "complete" | "error"

export type TaskProgressData = {
  title: string
  subtitle: string
  statusLine?: string
  steps: ProcessStep[]
  phase: TaskProgressPhase
}

export type ActionConfirmationStatus = "pending" | "confirmed" | "cancelled"

export type ActionConfirmationData = {
  id: string
  action: CopilotActionType
  data: CopilotActionPayload
  status: ActionConfirmationStatus
}

export type ActionLocalState = {
  action: CopilotActionType
  data: CopilotActionPayload
  status: ActionConfirmationStatus
}

export type AgroCopilotDataParts = {
  "dashboard-widgets": { widgets: Widget[] }
  "dashboard-cells": { cells: DashboardCellsPayload }
  "dashboard-loading": Record<string, never>
  "task-progress": TaskProgressData
  "action-confirmation": ActionConfirmationData
}

export type AgroCopilotUIMessage = UIMessage<unknown, AgroCopilotDataParts>

export function isDashboardWidgetsPart(
  part: AgroCopilotUIMessage["parts"][number]
): part is {
  type: "data-dashboard-widgets"
  data: { widgets: Widget[] }
} {
  return part.type === "data-dashboard-widgets"
}

export function isDashboardCellsPart(
  part: AgroCopilotUIMessage["parts"][number]
): part is {
  type: "data-dashboard-cells"
  data: { cells: DashboardCellsPayload }
} {
  return part.type === "data-dashboard-cells"
}

export function isDashboardLoadingPart(
  part: AgroCopilotUIMessage["parts"][number]
): part is {
  type: "data-dashboard-loading"
  data: Record<string, never>
} {
  return part.type === "data-dashboard-loading"
}

export function isTaskProgressPart(
  part: AgroCopilotUIMessage["parts"][number]
): part is {
  type: "data-task-progress"
  data: TaskProgressData
} {
  return part.type === "data-task-progress"
}

export function getLatestTaskProgress(
  message: AgroCopilotUIMessage
): TaskProgressData | null {
  const parts = message.parts.filter(isTaskProgressPart)
  return parts.at(-1)?.data ?? null
}

export function isActionConfirmationPart(
  part: AgroCopilotUIMessage["parts"][number]
): part is {
  type: "data-action-confirmation"
  data: ActionConfirmationData
} {
  return part.type === "data-action-confirmation"
}

export function getActionConfirmations(
  message: AgroCopilotUIMessage
): ActionConfirmationData[] {
  return message.parts.filter(isActionConfirmationPart).map((part) => part.data)
}
