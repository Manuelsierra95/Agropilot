type FarmEvent = {
  id: string

  // Identidad
  title: string
  description?: string

  // Tipo (clave para lógica y automatización)
  type:
    | "irrigation"
    | "fertilization"
    | "treatment"
    | "harvest"
    | "pruning"
    | "inspection"
    | "alert"

  // Clasificación UI
  category: string
  color: string

  // Tiempo
  startAt: string
  endAt?: string
  allDay?: boolean

  // Estado (clave para UX)
  status: "pending" | "in_progress" | "completed" | "skipped"

  // Prioridad → decisiones
  priority: "low" | "medium" | "high" | "critical"

  // Contexto agrícola (CLAVE)
  parcelId: string
  crop?: string // "olivar", "trigo", etc.

  // Datos accionables
  recommendation?: string // texto generado por sistema
  reason?: string // "Déficit hídrico", "Precio óptimo", etc.

  // Métricas rápidas (para dashboard)
  impact?: {
    cost?: number
    expectedYieldImpact?: number // %
    waterUse?: number // litros
  }

  // Etiquetas
  tags?: string[]

  // Automatización
  source: "manual" | "system" | "integration"

  // Auditoría
  createdAt: string
  updatedAt: string
}

/**
 * Datos mock de eventos agrícolas para hoy.
 * Asociados a las parcelas definidas en mockParcels.ts
 */
export const mockEvents: FarmEvent[] = [
  {
    id: "1",
    title: "Riego parcela norte",
    type: "irrigation",
    category: "Riego",
    color: "#3b82f6",

    startAt: "2026-05-06T06:00:00",
    endAt: "2026-05-06T08:00:00",

    status: "pending",
    priority: "high",

    parcelId: "parcel-1",
    crop: "olivar",

    recommendation: "Aplicar 2.500L por déficit hídrico",
    reason: "Humedad del suelo por debajo del 30%",

    impact: {
      waterUse: 2500,
      expectedYieldImpact: 8,
      cost: 12,
    },

    tags: ["automático"],
    source: "system",

    createdAt: "2026-05-05T10:00:00",
    updatedAt: "2026-05-05T10:00:00",
  },

  {
    id: "2",
    title: "Aplicación fertilizante NPK",
    description: "NPK 15-15-15 en parcela de trigo",
    type: "fertilization",
    category: "Fertilización",
    color: "#22c55e",

    startAt: "2026-05-07T08:30:00",
    endAt: "2026-05-07T11:00:00",

    status: "pending",
    priority: "medium",

    parcelId: "parcel-2",
    crop: "trigo",

    recommendation: "Aplicar 300kg/ha",
    reason: "Fase de crecimiento activo",

    impact: {
      cost: 85,
      expectedYieldImpact: 12,
    },

    tags: ["manual"],
    source: "manual",

    createdAt: "2026-05-05T10:00:00",
    updatedAt: "2026-05-05T10:00:00",
  },

  {
    id: "3",
    title: "Tratamiento fitosanitario",
    type: "treatment",
    category: "Sanidad",
    color: "#ef4444",

    startAt: "2026-05-05T07:00:00",

    status: "in_progress",
    priority: "critical",

    parcelId: "parcel-1",
    crop: "olivar",

    recommendation: "Aplicar cobre contra repilo",
    reason: "Alta humedad + riesgo de enfermedad",

    impact: {
      cost: 45,
      expectedYieldImpact: 15,
    },

    tags: ["alerta"],
    source: "system",

    createdAt: "2026-05-05T06:00:00",
    updatedAt: "2026-05-05T07:00:00",
  },

  {
    id: "4",
    title: "Inspección visual",
    type: "inspection",
    category: "Revisión",
    color: "#a855f7",

    startAt: "2026-05-08T09:00:00",

    status: "pending",
    priority: "low",

    parcelId: "parcel-3",
    crop: "olivar",

    recommendation: "Revisar presencia de plagas",
    reason: "Control semanal",

    source: "manual",

    createdAt: "2026-05-05T10:00:00",
    updatedAt: "2026-05-05T10:00:00",
  },
]
