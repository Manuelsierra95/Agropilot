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
    title: "Riego por goteo – Sector A",
    description: "Riego programado tras periodo de sequía",
    type: "irrigation",
    category: "Agua",
    color: "#3B82F6",
    startAt: new Date(Date.now() + 0 * 86_400_000).toISOString(),
    endAt: new Date(Date.now() + 0 * 86_400_000 + 2 * 3_600_000).toISOString(),
    allDay: false,
    status: "pending",
    priority: "high",
    parcelId: "Parcela A-03",
    crop: "Olivo",
    reason: "Déficit hídrico detectado por sensor",
    recommendation: "Aplicar 35 L/árbol durante 2 horas",
    impact: { waterUse: 12400, cost: 18 },
    tags: ["agua", "sensor"],
    source: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Abonado de fondo – Nitrógeno",
    type: "fertilization",
    category: "Nutrición",
    color: "#22C55E",
    startAt: new Date(
      Date.now() + 0 * 86_400_000 + 3 * 3_600_000
    ).toISOString(),
    endAt: new Date(Date.now() + 0 * 86_400_000 + 5 * 3_600_000).toISOString(),
    allDay: false,
    status: "in_progress",
    priority: "medium",
    parcelId: "Parcela B-01",
    crop: "Trigo blando",
    reason: "Estado fenológico: encañado",
    recommendation: "150 kg/ha de nitrato amónico 33,5%",
    impact: { cost: 210, expectedYieldImpact: 12 },
    tags: ["nitrógeno", "cereal"],
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Tratamiento fitosanitario – Mildiu",
    type: "treatment",
    category: "Sanidad vegetal",
    color: "#EF4444",
    startAt: new Date(Date.now() + 1 * 86_400_000).toISOString(),
    endAt: new Date(Date.now() + 1 * 86_400_000 + 3 * 3_600_000).toISOString(),
    allDay: false,
    status: "pending",
    priority: "critical",
    parcelId: "Parcela C-02",
    crop: "Viña",
    reason: "Alerta de riesgo por lluvia y temperatura alta",
    recommendation: "Fosetil Al 2 kg/ha, repetir en 10 días",
    impact: { cost: 95, expectedYieldImpact: 20 },
    tags: ["hongo", "preventivo"],
    source: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Inspección de plagas",
    type: "inspection",
    category: "Vigilancia",
    color: "#A855F7",
    startAt: new Date(
      Date.now() + 1 * 86_400_000 + 9 * 3_600_000
    ).toISOString(),
    allDay: false,
    status: "pending",
    priority: "low",
    parcelId: "Parcela A-01",
    crop: "Almendro",
    reason: "Revisión rutinaria quincenal",
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Poda en verde",
    type: "pruning",
    category: "Mantenimiento",
    color: "#F59E0B",
    startAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    endAt: new Date(Date.now() + 3 * 86_400_000 + 6 * 3_600_000).toISOString(),
    allDay: false,
    status: "pending",
    priority: "medium",
    parcelId: "Parcela D-05",
    crop: "Melocotón",
    recommendation: "Mantener 2 brotes por rama principal",
    impact: { cost: 340 },
    tags: ["poda", "frutal"],
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Cosecha de cebada",
    type: "harvest",
    category: "Recolección",
    color: "#78716C",
    startAt: new Date(Date.now() + 4 * 86_400_000).toISOString(),
    allDay: true,
    status: "pending",
    priority: "high",
    parcelId: "Parcela B-04",
    crop: "Cebada",
    reason: "Humedad del grano al 12%, óptima para recolección",
    impact: { cost: 1200 },
    tags: ["cereal", "cosecha"],
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Cosecha de cebada",
    type: "harvest",
    category: "Recolección",
    color: "#78716C",
    startAt: new Date(Date.now() + 4 * 86_400_000).toISOString(),
    allDay: true,
    status: "pending",
    priority: "high",
    parcelId: "Parcela B-04",
    crop: "Cebada",
    reason: "Humedad del grano al 12%, óptima para recolección",
    impact: { cost: 1200 },
    tags: ["cereal", "cosecha"],
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    title: "Cosecha de cebada",
    type: "harvest",
    category: "Recolección",
    color: "#78716C",
    startAt: new Date(Date.now() + 4 * 86_400_000).toISOString(),
    allDay: true,
    status: "pending",
    priority: "high",
    parcelId: "Parcela B-04",
    crop: "Cebada",
    reason: "Humedad del grano al 12%, óptima para recolección",
    impact: { cost: 1200 },
    tags: ["cereal", "cosecha"],
    source: "manual",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
