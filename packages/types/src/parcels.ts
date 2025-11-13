export type GeometryType =
  | 'Polygon'
  | 'Point'
  | 'LineString'
  | 'MultiPolygon'
  | 'MultiPoint'
  | 'MultiLineString'

export interface Parcel {
  id?: number
  userId?: string
  name: string
  area: number | null
  type: string | null
  irrigationType: string | null
  geometryType: GeometryType
  geometryCoordinates: number[][][] // Para Polygon: [[[lng, lat], [lng, lat], ...]]
  description: string | null
  createdAt?: Date
  updatedAt?: Date
}

export type ParcelInsert = Omit<Parcel, 'id' | 'createdAt' | 'updatedAt'>

export type ParcelDB = Required<Omit<Parcel, 'userId'>> & { userId: string }
