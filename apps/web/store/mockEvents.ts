export interface Event {
  id: string
  title: string
  description?: string
  category: string
  color: string
  startTime: string
  endTime: string
  tags?: string[]
  parcelId: string
}

/**
 * Datos mock de eventos agrícolas para hoy.
 * Asociados a las parcelas definidas en mockParcels.ts
 */
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Riego por goteo - Zona Norte',
    description: 'Activar sistema de riego automático en la zona norte del olivar.',
    category: 'Riego',
    color: '#3b82f6',
    startTime: '2026-03-02T07:00:00',
    endTime: '2026-03-02T09:00:00',
    tags: ['automatizado', 'zona norte'],
    parcelId: '1',
  },
  {
    id: '2',
    title: 'Aplicación de fertilizante',
    description: 'Aplicar fertilizante NPK 15-15-15 en la parcela de trigo.',
    category: 'Fertilización',
    color: '#22c55e',
    startTime: '2026-03-02T08:30:00',
    endTime: '2026-03-02T11:00:00',
    tags: ['NPK', 'manual'],
    parcelId: '2',
  },
  {
    id: '3',
    title: 'Inspección fitosanitaria',
    description: 'Revisión de plagas y enfermedades en el viñedo. Especial atención al mildiu.',
    category: 'Inspección',
    color: '#f59e0b',
    startTime: '2026-03-02T10:00:00',
    endTime: '2026-03-02T12:00:00',
    tags: ['plagas', 'mildiu'],
    parcelId: '3',
  },
  {
    id: '4',
    title: 'Cosecha de girasol',
    description: 'Inicio de la recolección mecanizada del girasol.',
    category: 'Cosecha',
    color: '#ef4444',
    startTime: '2026-03-02T06:00:00',
    endTime: '2026-03-02T14:00:00',
    tags: ['mecanizada'],
    parcelId: '4',
  },
  {
    id: '5',
    title: 'Poda de mantenimiento',
    description: 'Poda ligera de formación en los olivos jóvenes.',
    category: 'Poda',
    color: '#8b5cf6',
    startTime: '2026-03-02T09:00:00',
    endTime: '2026-03-02T13:00:00',
    tags: ['formación', 'jóvenes'],
    parcelId: '1',
  },
  {
    id: '6',
    title: 'Revisión de cercados',
    description: 'Verificar el estado de los cercados perimetrales de la dehesa.',
    category: 'Mantenimiento',
    color: '#6366f1',
    startTime: '2026-03-02T15:00:00',
    endTime: '2026-03-02T17:00:00',
    tags: ['perímetro'],
    parcelId: '5',
  },
  {
    id: '7',
    title: 'Análisis de suelo',
    description: 'Toma de muestras de suelo para análisis de nutrientes.',
    category: 'Análisis',
    color: '#14b8a6',
    startTime: '2026-03-02T11:00:00',
    endTime: '2026-03-02T12:30:00',
    tags: ['nutrientes', 'laboratorio'],
    parcelId: '2',
  },
]
