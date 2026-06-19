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
