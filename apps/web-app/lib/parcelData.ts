import { apiClient } from '@/lib/apiClient'

type ApiParcel = {
  id: number
  userId: string
  name: string
  area: number | null
  type: string | null
  irrigationType: string | null
  geometryType:
    | 'Polygon'
    | 'Point'
    | 'LineString'
    | 'MultiPolygon'
    | 'MultiPoint'
    | 'MultiLineString'
  geometryCoordinates: number[][][]
  description: string | null
  createdAt: string
  updatedAt: string
}

type ApiResponse = {
  message: string
  timestamp: string
  status: number
  data: ApiParcel[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

type CreateParcelInput = {
  name: string
  area?: number | null
  type?: string | null
  irrigationType?: string | null
  geometryType:
    | 'Polygon'
    | 'Point'
    | 'LineString'
    | 'MultiPolygon'
    | 'MultiPoint'
    | 'MultiLineString'
  geometryCoordinates: number[][][]
  description?: string | null
}

type UpdateParcelInput = Partial<{
  name: string
  area: number | null
  type: string | null
  irrigationType: string | null
  geometryType:
    | 'Polygon'
    | 'Point'
    | 'LineString'
    | 'MultiPolygon'
    | 'MultiPoint'
    | 'MultiLineString'
  geometryCoordinates: number[][][]
  description: string | null
}>

export async function getUserParcels(params?: {
  page?: number
  limit?: number
  type?: string
  irrigationType?: string
}): Promise<ApiParcel[]> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.type) searchParams.set('type', params.type)
  if (params?.irrigationType)
    searchParams.set('irrigationType', params.irrigationType)

  const query = searchParams.toString()
  const response = await apiClient.get<ApiResponse>(
    `/parcels${query ? `?${query}` : ''}`
  )
  return response.data
}

export async function getParcelById(id: number): Promise<ApiParcel> {
  return apiClient.get<ApiParcel>(`/parcels/${id}`)
}

export async function createParcel(
  parcel: CreateParcelInput
): Promise<ApiParcel> {
  return apiClient.post<ApiParcel>('/parcels', parcel)
}

export async function updateParcel(
  id: number,
  parcel: UpdateParcelInput
): Promise<ApiParcel> {
  return apiClient.put<ApiParcel>(`/parcels/${id}`, parcel)
}

export async function deleteParcel(id: number): Promise<void> {
  return apiClient.delete(`/parcels/${id}`)
}
