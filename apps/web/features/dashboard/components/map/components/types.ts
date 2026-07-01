export type Parcel = {
  id: string
  name: string
  area: number
  type: string
  color: string
  geometryType: "Polygon"
  geometryCoordinates: number[][][]
}

export type ParcelLngLat = [number, number]
