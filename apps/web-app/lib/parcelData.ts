import { apiClient } from '@/lib/apiClient'

type ParcelResponse = {
  data?: ApiParcel[]
  status: number
  error: string | null
}

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
  createdAt: Date
  updatedAt: Date
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
}): Promise<ParcelResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.type) searchParams.set('type', params.type)
  if (params?.irrigationType)
    searchParams.set('irrigationType', params.irrigationType)

  const query = searchParams.toString()
  const { data, status, error } = await apiClient.get<ApiResponse>(
    `/parcels${query ? `?${query}` : ''}`
  )
  return { data: data?.data ?? [], status, error: error ?? null }
}

export async function getParcelById(id: number): Promise<ApiParcel> {
  const { data } = await apiClient.get<ApiResponse>(`/parcels/${id}`)
  return data?.data[0] as ApiParcel
}

export async function createParcel(
  parcel: CreateParcelInput
): Promise<ParcelResponse> {
  const { data, status, error } = await apiClient.post<ApiResponse>(
    '/parcels',
    parcel
  )
  return { data: data?.data, status, error: error ?? null }
}

export async function updateParcel(
  id: number,
  parcel: UpdateParcelInput
): Promise<ParcelResponse> {
  const { data, status, error } = await apiClient.put<ApiResponse>(
    `/parcels/${id}`,
    parcel
  )
  return { data: data?.data, status, error: error ?? null }
}

export async function deleteParcel(id: number): Promise<void> {
  await apiClient.delete(`/parcels/${id}`)
}
