// ==============================
// Types
// ==============================

export type CalendarEventType =
  | "irrigation"
  | "treatment"
  | "fertilization"
  | "harvest"
  | "inspection"
  | "alert"

export type CalendarEventPriority = "low" | "medium" | "high"

export interface CalendarEventMeta {
  dose?: string
  product?: string
  waterAmount?: number // litros
  notes?: string
  priority?: CalendarEventPriority
}

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType

  parcelId: string
  parcelName: string

  color: string

  start: Date
  end: Date

  meta?: CalendarEventMeta
}

// ==============================
// Helpers
// ==============================

const d = (date: string) => new Date(date)

// ==============================
// Mock Data
// ==============================

export const calendarMockData: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Riego parcela norte",
    type: "irrigation",
    parcelId: "parcel-1",
    parcelName: "Olivar La Loma",
    color: "blue",
    start: d("2026-03-28T07:00:00"),
    end: d("2026-03-28T09:00:00"),
    meta: {
      waterAmount: 12000,
      notes: "Riego por baja humedad del suelo",
      priority: "high",
    },
  },
  {
    id: "event-2",
    title: "Tratamiento contra prays",
    type: "treatment",
    parcelId: "parcel-1",
    parcelName: "Olivar La Loma",
    color: "red",
    start: d("2026-03-30T06:30:00"),
    end: d("2026-03-30T08:00:00"),
    meta: {
      product: "Bacillus thuringiensis",
      dose: "1.5 kg/ha",
      notes: "Aplicar antes de subida de temperatura",
      priority: "high",
    },
  },
  {
    id: "event-3",
    title: "Fertilización de primavera",
    type: "fertilization",
    parcelId: "parcel-2",
    parcelName: "Finca El Cerro",
    color: "green",
    start: d("2026-04-02T08:00:00"),
    end: d("2026-04-02T10:00:00"),
    meta: {
      product: "NPK 15-15-15",
      dose: "300 kg/ha",
      priority: "medium",
    },
  },
  {
    id: "event-4",
    title: "Inspección de plagas",
    type: "inspection",
    parcelId: "parcel-2",
    parcelName: "Finca El Cerro",
    color: "yellow",
    start: d("2026-04-05T07:30:00"),
    end: d("2026-04-05T08:30:00"),
    meta: {
      notes: "Revisar mosca del olivo",
      priority: "medium",
    },
  },
  {
    id: "event-5",
    title: "Alerta viento fuerte",
    type: "alert",
    parcelId: "parcel-1",
    parcelName: "Olivar La Loma",
    color: "orange",
    start: d("2026-04-07T00:00:00"),
    end: d("2026-04-07T23:59:00"),
    meta: {
      notes: "Evitar tratamientos foliares",
      priority: "high",
    },
  },
  {
    id: "event-6",
    title: "Revisión sistema de riego",
    type: "inspection",
    parcelId: "parcel-1",
    parcelName: "Olivar La Loma",
    color: "purple",
    start: d("2026-04-10T09:00:00"),
    end: d("2026-04-10T11:00:00"),
    meta: {
      notes: "Comprobar goteros",
      priority: "low",
    },
  },
  {
    id: "event-7",
    title: "Riego correctivo",
    type: "irrigation",
    parcelId: "parcel-2",
    parcelName: "Finca El Cerro",
    color: "blue",
    start: d("2026-04-12T06:30:00"),
    end: d("2026-04-12T08:30:00"),
    meta: {
      waterAmount: 9000,
      priority: "high",
    },
  },
  {
    id: "event-8",
    title: "Aplicación cobre",
    type: "treatment",
    parcelId: "parcel-2",
    parcelName: "Finca El Cerro",
    color: "red",
    start: d("2026-04-15T07:00:00"),
    end: d("2026-04-15T09:00:00"),
    meta: {
      product: "Oxicloruro de cobre",
      dose: "2 kg/ha",
      priority: "medium",
    },
  },
]
