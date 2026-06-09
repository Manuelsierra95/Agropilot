import type { ProcessStep, TaskProgressData } from "../schemas/chat-types"

export const TASK_STEP_DEFINITIONS: { id: string; label: string }[] = [
  { id: "llm_queries", label: "Consultas LLM" },
  { id: "fetching_data", label: "Obteniendo datos" },
  { id: "processing_results", label: "Procesando resultados" },
  { id: "building_widgets", label: "Construyendo widgets" },
  { id: "updating_view", label: "Actualizando vista" },
]

export function createInitialSteps(): ProcessStep[] {
  return TASK_STEP_DEFINITIONS.map((step) => ({
    ...step,
    status: "pending" as const,
  }))
}

export function createPendingTaskProgress(
  statusLine = "Iniciando…"
): TaskProgressData {
  const steps = createInitialSteps().map((step) =>
    step.id === "llm_queries"
      ? { ...step, status: "running" as const }
      : step
  )

  return {
    title: "Copilot",
    subtitle: "Generando…",
    statusLine,
    steps,
    phase: "running",
  }
}
