const DEFAULT_SUGGESTIONS = [
  "Muéstrame ingresos y gastos del último trimestre",
  "¿Cómo está el clima en mis parcelas?",
  "Crea una tarea de riego para mañana",
] as const

export async function getCopilotSuggestions(): Promise<string[]> {
  return [...DEFAULT_SUGGESTIONS]
}
