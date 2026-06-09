const MULTI_RISK_PATTERN =
  /\b(qué|que|cuáles|cuales|cuántos|cuantos)\b.*\briesgos?\b/i

const TEMPORAL_RANGE_PATTERN =
  /\b(semana|mes|días|dias|período|periodo|últimos|ultimos)\b/i

const RISK_KEYWORD_PATTERN =
  /\b(riesgos?|alerta|urgente|helada|estrés hídrico|estres hidrico|peligro)\b/i

export function isMultiRiskAnalysis(userText: string): boolean {
  const text = userText.toLowerCase()
  if (!RISK_KEYWORD_PATTERN.test(text)) return false
  return MULTI_RISK_PATTERN.test(text) || TEMPORAL_RANGE_PATTERN.test(text)
}

export function isSingleRiskQuestion(userText: string): boolean {
  const text = userText.toLowerCase()
  if (!RISK_KEYWORD_PATTERN.test(text)) return false
  if (isMultiRiskAnalysis(userText)) return false
  return true
}
