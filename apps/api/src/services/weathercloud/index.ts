type SeedRiskLevel = "low" | "medium" | "high"

type SeedRisks = {
  frost?: SeedRiskLevel
  drought?: SeedRiskLevel
  pest?: SeedRiskLevel
  waterStress?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  fungalRisk?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  insectRisk?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
  thermalStress?: { level?: SeedRiskLevel; score?: number; reasons?: string[] }
}

function getLevel(score: number): SeedRiskLevel {
  if (score >= 70) return "high"
  if (score >= 40) return "medium"
  return "low"
}

type PhenologyStage =
  | "dormancy"
  | "sprouting"
  | "flowering"
  | "fruit_set"
  | "ripening"
  | "harvest"

export function getOlivePhenology(date: Date): PhenologyStage {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )

  // Aproximación Andalucía (ajustable por zona)
  if (dayOfYear < 60) return "dormancy" // Ene-Feb
  if (dayOfYear < 120) return "sprouting" // Mar-Abr
  if (dayOfYear < 160) return "flowering" // May
  if (dayOfYear < 220) return "fruit_set" // Jun-Jul
  if (dayOfYear < 300) return "ripening" // Ago-Oct
  return "harvest" // Nov-Dic
}

type AgroContext = {
  crop: string
  irrigation: boolean
  phenology: PhenologyStage
}

export function computeSeedRisks(
  weather: any,
  context: AgroContext
): SeedRisks {
  const temp = weather.temp
  const hum = weather.hum
  const wind = weather.wspd
  const rain = weather.rainrate
  const perceived = weather.computed?.feel ?? temp

  /* ---------------- FROST ---------------- */
  let frost: SeedRiskLevel =
    perceived <= 0 ? "high" : perceived <= 3 ? "medium" : "low"

  /* ---------------- DROUGHT ---------------- */
  let drought: SeedRiskLevel =
    temp > 32 && hum < 35 && rain === 0
      ? "high"
      : temp > 28 && hum < 50
        ? "medium"
        : "low"

  /* ---------------- WATER STRESS ---------------- */
  let waterScore = 0
  const waterReasons: string[] = []

  if (temp > 30) {
    waterScore += 30
    waterReasons.push("Temperatura alta")
  }

  if (hum < 40) {
    waterScore += 25
    waterReasons.push("Humedad baja")
  }

  if (wind > 4) {
    waterScore += 20
    waterReasons.push("Viento elevado")
  }

  if (rain === 0) {
    waterScore += 15
    waterReasons.push("Sin lluvia")
  }

  if (perceived > 35) {
    waterScore += 10
    waterReasons.push("Sensación térmica alta")
  }

  // CONTEXTO AGRÍCOLA
  if (!context.irrigation) {
    waterScore += 20
    waterReasons.push("Cultivo en secano")
  }

  if (context.phenology === "fruit_set") {
    waterScore += 25
    waterReasons.push("Fase crítica (cuajado)")
  }

  if (context.phenology === "ripening") {
    waterScore += 10
    waterReasons.push("Engorde de fruto")
  }

  waterScore = Math.min(100, waterScore)

  /* ---------------- FUNGAL ---------------- */
  let fungalScore = 0
  const fungalReasons: string[] = []

  if (hum > 85) {
    fungalScore += 40
    fungalReasons.push("Humedad alta")
  }

  if (temp > 10 && temp < 25) {
    fungalScore += 25
    fungalReasons.push("Temperatura favorable")
  }

  if (rain > 0.2) {
    fungalScore += 30
    fungalReasons.push("Lluvia")
  }

  if (wind < 2) {
    fungalScore += 5
    fungalReasons.push("Baja ventilación")
  }

  if (context.phenology === "sprouting" || context.phenology === "flowering") {
    fungalScore += 15
    fungalReasons.push("Fase sensible (repilo)")
  }

  fungalScore = Math.min(100, fungalScore)

  /* ---------------- INSECT ---------------- */
  let insectScore = 0
  const insectReasons: string[] = []

  if (temp > 22 && temp < 35) {
    insectScore += 40
    insectReasons.push("Temperatura favorable")
  }

  if (hum > 40) {
    insectScore += 20
    insectReasons.push("Humedad adecuada")
  }

  if (context.phenology === "fruit_set" || context.phenology === "ripening") {
    insectScore += 25
    insectReasons.push("Periodo mosca del olivo")
  }

  if (temp < 12) {
    insectScore = 0
    insectReasons.length = 0
    insectReasons.push("Frío reduce actividad")
  }

  insectScore = Math.min(100, insectScore)

  /* ---------------- THERMAL ---------------- */
  let thermalScore = 0
  const thermalReasons: string[] = []

  if (perceived > 35) {
    thermalScore += 50
    thermalReasons.push("Calor extremo")
  } else if (perceived > 30) {
    thermalScore += 30
    thermalReasons.push("Calor alto")
  }

  if (perceived < 0) {
    thermalScore += 50
    thermalReasons.push("Frío extremo")
  } else if (perceived < 5) {
    thermalScore += 30
    thermalReasons.push("Frío relevante")
  }

  if (context.phenology === "flowering" && perceived > 32) {
    thermalScore += 20
    thermalReasons.push("Afecta floración")
  }

  thermalScore = Math.min(100, thermalScore)

  return {
    frost,
    drought,
    pest: getLevel(insectScore),

    waterStress: {
      level: getLevel(waterScore),
      score: waterScore,
      reasons: waterReasons,
    },

    fungalRisk: {
      level: getLevel(fungalScore),
      score: fungalScore,
      reasons: fungalReasons,
    },

    insectRisk: {
      level: getLevel(insectScore),
      score: insectScore,
      reasons: insectReasons,
    },

    thermalStress: {
      level: getLevel(thermalScore),
      score: thermalScore,
      reasons: thermalReasons,
    },
  }
}

/* -------------------------------------------------------------------------- */
/*                           Recommendation Types                             */
/* -------------------------------------------------------------------------- */

export type WeatherRiskLevel = "low" | "medium" | "high"

export type RiskAction = {
  type: "irrigation" | "treatment" | "inspection" | "note"
  label: string
  payload?: Record<string, unknown>
}

export type RiskRecommendation = {
  riskType: "frost" | "drought" | "waterStress" | "fungalRisk" | "insectRisk" | "thermalStress"
  title: string
  description: string
  urgency: "low" | "medium" | "high"
  window?: string
  actions: RiskAction[]
}

export type ParcelApiRiskDetail = {
  level: WeatherRiskLevel
  score: number
  reasons: string[]
  recommendation?: RiskRecommendation
}

/* -------------------------------------------------------------------------- */
/*                         Recommendation Generator                           */
/* -------------------------------------------------------------------------- */

function getPhenologyWindow(phenology: PhenologyStage): string | undefined {
  const windows: Partial<Record<PhenologyStage, string>> = {
    dormancy: "Aplicar antes de brotación",
    sprouting: "Recomendar antes de floración",
    flowering: "Actuar antes de cuajado",
    fruit_set: "Mantener hasta envero",
    ripening: "Vigilar hasta recolección",
  }
  return windows[phenology]
}

function recommendWaterStress(
  score: number,
  _weather: any,
  context: AgroContext
): RiskRecommendation | undefined {
  if (score < 40) return undefined

  const isHigh = score >= 70
  const window = getPhenologyWindow(context.phenology)

  if (isHigh) {
    return {
      riskType: "waterStress",
      title: "Riego urgente requerido",
      description:
        "Las condiciones indican estrés hídrico severo. Se recomienda aplicar riego suplementario inmediato para evitar daños en el cultivo.",
      urgency: "high",
      window,
      actions: [
        { type: "irrigation", label: "Aplicar riego suplementario (+30%)" },
        ...(context.irrigation
          ? [{ type: "inspection" as const, label: "Revisar sistema de riego" }]
          : []),
        { type: "note", label: "Monitorizar humedad del suelo" },
      ],
    }
  }

  return {
    riskType: "waterStress",
    title: "Incrementar volumen de riego",
    description:
      "Estrés hídrico moderado detectado. Considere aumentar la cantidad de riego y aplicar en las horas de menor evapotranspiración.",
    urgency: "medium",
    window,
    actions: [
      { type: "irrigation", label: "Regar en horas tempranas o tardías" },
      { type: "note", label: "Aplicar acolchado para retener humedad" },
    ],
  }
}

function recommendFungal(
  score: number,
  _weather: any,
  context: AgroContext
): RiskRecommendation | undefined {
  if (score < 40) return undefined

  const isHigh = score >= 70
  const isSproutingFlowering =
    context.phenology === "sprouting" || context.phenology === "flowering"

  if (isHigh) {
    return {
      riskType: "fungalRisk",
      title: "Tratamiento fungicida preventivo",
      description:
        "Condiciones favorables para el desarrollo de hongos (humedad alta, temperatura moderada). Se recomienda aplicar tratamiento preventivo.",
      urgency: "high",
      window: isSproutingFlowering
        ? "CRÍTICO — Fase sensible a repilo"
        : "Aplicar en las próximas 48h",
      actions: [
        { type: "treatment", label: "Aplicar fungicida preventivo" },
        { type: "inspection", label: "Revisar hojas en zonas bajas" },
        { type: "note", label: "Evitar riego por aspersión" },
      ],
    }
  }

  return {
    riskType: "fungalRisk",
    title: "Mejorar ventilación del copa",
    description:
      "Riesgo moderado de hongos. Considere mejorar la ventilación del copa y vigilar los primeros síntomas.",
    urgency: "medium",
    window: getPhenologyWindow(context.phenology),
    actions: [
      { type: "inspection", label: "Vigilar síntomas de repilo" },
      { type: "note", label: "Evitar densidad excesiva en copa" },
    ],
  }
}

function recommendInsect(
  score: number,
  _weather: any,
  context: AgroContext
): RiskRecommendation | undefined {
  if (score < 40) return undefined

  const isHigh = score >= 70
  const isFlySeason =
    context.phenology === "fruit_set" || context.phenology === "ripening"

  if (isHigh) {
    return {
      riskType: "insectRisk",
      title: "Instalar trampas mosca del olivo",
      description:
        "Condiciones favorables para la mosca del olivo. Se recomienda instalar trampas y realizar monitoreo activo.",
      urgency: "high",
      window: isFlySeason
        ? "CRÍTICO — Periodo activo de mosca"
        : "Preparar antes de periodo de riesgo",
      actions: [
        { type: "treatment", label: "Instalar trampas con atrayente" },
        { type: "inspection", label: "Revisar frutos cada 3-4 días" },
        ...(isFlySeason
          ? [{ type: "treatment" as const, label: "Considerar tratamiento fitosanitario" }]
          : []),
      ],
    }
  }

  return {
    riskType: "insectRisk",
    title: "Monitoreo activo de plagas",
    description:
      "Condiciones moderadas para actividad de plagas. Se recomienda vigilancia periódica.",
    urgency: "medium",
    window: getPhenologyWindow(context.phenology),
    actions: [
      { type: "inspection", label: "Revisar trampas semanalmente" },
      { type: "note", label: "Control biológico preventivo" },
    ],
  }
}

function recommendThermal(
  score: number,
  weather: any,
  context: AgroContext
): RiskRecommendation | undefined {
  if (score < 40) return undefined

  const isHigh = score >= 70
  const perceived = weather.computed?.feel ?? weather.temp

  if (isHigh && perceived > 30) {
    return {
      riskType: "thermalStress",
      title: "Sombreado y riego de emergencia",
      description:
        "Estrés térmico severo por calor. Proteger el cultivo con sombreado y aplicar riego de emergencia.",
      urgency: "high",
      window: context.phenology === "flowering"
        ? "CRÍTICO — Afecta a floración"
        : undefined,
      actions: [
        { type: "irrigation", label: "Riego de emergencia en horas pico" },
        { type: "note", label: "Activar sombra si disponible" },
        { type: "note", label: "Evitar poda o laboreo" },
      ],
    }
  }

  if (isHigh && perceived < 5) {
    return {
      riskType: "thermalStress",
      title: "Protección contra frío",
      description:
        "Estrés térmico por frío relevante. Proteger los órganos sensibles del cultivo.",
      urgency: "high",
      window: context.phenology === "flowering"
        ? "CRÍTICO — Floración sensible al frío"
        : undefined,
      actions: [
        { type: "note", label: "Activar sistemas antihelada" },
        { type: "note", label: "No regar antes de la helada" },
      ],
    }
  }

  return {
    riskType: "thermalStress",
    title: "Incrementar riego en horas pico",
    description:
      "Estrés térmico moderado. Aumente la frecuencia de riego y evite trabajo de campo en las horas más calurosas.",
    urgency: "medium",
    window: getPhenologyWindow(context.phenology),
    actions: [
      { type: "irrigation", label: "Regar temprano o al atardecer" },
      { type: "note", label: "Evitar campo entre 12:00-16:00" },
    ],
  }
}

function recommendFrost(
  score: SeedRiskLevel,
  context: AgroContext
): RiskRecommendation | undefined {
  if (score === "low") return undefined

  const isHigh = score === "high"

  return {
    riskType: "frost",
    title: isHigh ? "Protección urgente contra heladas" : "Vigilancia de heladas",
    description: isHigh
      ? "Riesgo alto de helada. Activar todos los sistemas de protección disponibles."
      : "Posible helada leve. Preparar sistemas de protección.",
    urgency: isHigh ? "high" : "medium",
    window: context.phenology === "flowering"
      ? "CRÍTICO — Floración muy sensible"
      : context.phenology === "sprouting"
        ? "Brotación sensible al frío"
        : undefined,
    actions: [
      { type: "note", label: "Activar sistemas antihelada" },
      { type: "note", label: "No regar antes de la helada (suelo húmedo irradia más frío)" },
      ...(isHigh
        ? [{ type: "note" as const, label: "Cubrir con mantas térmicas" }]
        : []),
    ],
  }
}

function recommendDrought(
  score: SeedRiskLevel,
  _weather: any,
  _context: AgroContext
): RiskRecommendation | undefined {
  if (score === "low") return undefined

  const isHigh = score === "high"

  return {
    riskType: "drought",
    title: isHigh
      ? "Sequía severa — Riego prioritario"
      : "Condiciones de sequía — Optimizar riego",
    description: isHigh
      ? "Sequía severa detectada. Priorice el riego y reduzca al mínimo el consumo de agua no esencial."
      : "Condiciones secas. Optimice el programa de riego para mantener la humedad del suelo.",
    urgency: isHigh ? "high" : "medium",
    actions: [
      { type: "irrigation", label: "Regar en horas de menor evapotranspiración" },
      { type: "note", label: "Aplicar acolchado orgánico" },
      { type: "note", label: "Monitorizar humedad del suelo" },
    ],
  }
}

export function generateRecommendations(
  weather: any,
  risks: SeedRisks,
  context: AgroContext
): RiskRecommendation[] {
  const recommendations: RiskRecommendation[] = []

  if (risks.frost) {
    const rec = recommendFrost(risks.frost, context)
    if (rec) recommendations.push(rec)
  }

  if (risks.drought) {
    const rec = recommendDrought(risks.drought, weather, context)
    if (rec) recommendations.push(rec)
  }

  if (risks.waterStress?.score != null) {
    const rec = recommendWaterStress(risks.waterStress.score, weather, context)
    if (rec) recommendations.push(rec)
  }

  if (risks.fungalRisk?.score != null) {
    const rec = recommendFungal(risks.fungalRisk.score, weather, context)
    if (rec) recommendations.push(rec)
  }

  if (risks.insectRisk?.score != null) {
    const rec = recommendInsect(risks.insectRisk.score, weather, context)
    if (rec) recommendations.push(rec)
  }

  if (risks.thermalStress?.score != null) {
    const rec = recommendThermal(risks.thermalStress.score, weather, context)
    if (rec) recommendations.push(rec)
  }

  return recommendations
}
