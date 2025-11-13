import type { Parcel } from '@workspace/types/parcels'

/**
 * Función helper para crear una nueva parcela con geometría tipo Polygon
 */
export function createParcelPolygon(
  name: string,
  coordinates: number[][][],
  options?: {
    id?: number
    area?: number
    type?: string
    irrigationType?: string
    description?: string
  }
): Parcel {
  return {
    id: options?.id,
    name,
    area: options?.area ?? null,
    type: options?.type ?? null,
    irrigationType: options?.irrigationType ?? null,
    geometryType: 'Polygon',
    geometryCoordinates: coordinates,
    description: options?.description ?? null,
  }
}

/**
 * Función helper para crear una nueva parcela con geometría tipo Point
 */
export function createParcelPoint(
  name: string,
  coordinates: number[],
  options?: {
    id?: number
    area?: number
    type?: string
    irrigationType?: string
    description?: string
  }
): Parcel {
  return {
    id: options?.id,
    name,
    area: options?.area ?? null,
    type: options?.type ?? null,
    irrigationType: options?.irrigationType ?? null,
    geometryType: 'Point',
    geometryCoordinates: [[coordinates]],
    description: options?.description ?? null,
  }
}
