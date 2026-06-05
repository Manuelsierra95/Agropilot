export type PlaceSuggestion = {
  id: string
  label: string
  lat: number
  lng: number
  type?: string
}

export type SearchPlacesOptions = {
  limit?: number
  signal?: AbortSignal
}
