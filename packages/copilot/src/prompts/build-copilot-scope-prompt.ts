import type { CopilotContext } from "../types/execute-query"

export function buildCopilotScopePrompt(ctx: CopilotContext): string {
  const orgLine = ctx.organizationName
    ? `Organización activa: ${ctx.organizationName} (${ctx.organizationId}).`
    : `Organización activa: ${ctx.organizationId}.`

  const parcelLine = ctx.activeParcelId
    ? ctx.activeParcelName
      ? `Parcela activa: ${ctx.activeParcelName} (${ctx.activeParcelId}).`
      : `Parcela activa: ${ctx.activeParcelId}.`
    : "Sin parcela activa en el dashboard: responde a nivel de toda la organización salvo que el usuario nombre una parcela concreta."

  return `
## Contexto de la sesión
${orgLine}
${parcelLine}

## Alcance de datos
- Preguntas sobre clima, cashflow o datos de UNA parcela → usa la parcela activa en las tools (omite parcelId o usa la activa).
- Preguntas globales (totales, todas las parcelas, finanzas de la explotación) → ámbito organización; no fuerces parcelId en las tools.
- Si el usuario nombra otra parcela distinta a la activa, prioriza su petición explícita.
`
}
