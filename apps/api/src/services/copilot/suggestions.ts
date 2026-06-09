const DEFAULT_SUGGESTIONS = [
  "¿Qué temperatura hace hoy?",
  "Precios Virgen y Virgen Extra en enero",
  "Créame una tarea para el lunes de fumigar Olivos",
] as const

export async function getCopilotSuggestions(): Promise<string[]> {
  return [...DEFAULT_SUGGESTIONS]
}
