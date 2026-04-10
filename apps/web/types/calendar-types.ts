export type EventType = 
  | 'siembra'
  | 'riego'
  | 'fertilizacion'
  | 'cosecha'
  | 'fumigacion'
  | 'mantenimiento'
  | 'inspeccion'
  | 'otro'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: Date
  type: EventType
  parcela?: string
  completed?: boolean
}

export const eventTypeConfig: Record<EventType, { label: string; icon: string }> = {
  siembra: { label: 'Siembra', icon: '🌱' },
  riego: { label: 'Riego', icon: '💧' },
  fertilizacion: { label: 'Fertilización', icon: '🧪' },
  cosecha: { label: 'Cosecha', icon: '🌾' },
  fumigacion: { label: 'Fumigación', icon: '🔬' },
  mantenimiento: { label: 'Mantenimiento', icon: '🔧' },
  inspeccion: { label: 'Inspección', icon: '👁️' },
  otro: { label: 'Otro', icon: '📋' },
}

export const parcelas = [
  'Parcela Norte A',
  'Parcela Norte B',
  'Parcela Sur',
  'Parcela Este',
  'Parcela Oeste',
  'Invernadero 1',
  'Invernadero 2',
]
