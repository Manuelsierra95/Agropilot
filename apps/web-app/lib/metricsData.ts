import { apiClient } from '@/lib/apiClient'

type ApiMetric = {
  id: number
  userId: string
  parcelId: number | null
  metricType: string
  value: number
  previousValue: number | null
  unit: string
  source: 'manual' | 'api' | 'sensor' | 'calculated'
  metadata: Record<string, any> | null
  date: string
  createdAt: string
  updatedAt: string
}

type ApiResponse = {
  message: string
  timestamp: string
  status: number
  data: ApiMetric[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getUserMetrics(params?: {
  page?: number
  limit?: number
  metricType?: string
  parcelId?: number
  source?: 'manual' | 'api' | 'sensor' | 'calculated'
  startDate?: Date
  endDate?: Date
}): Promise<ApiMetric[]> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.metricType) searchParams.set('metricType', params.metricType)
  if (params?.parcelId) searchParams.set('parcelId', params.parcelId.toString())
  if (params?.source) searchParams.set('source', params.source)
  if (params?.startDate)
    searchParams.set('startDate', params.startDate.toISOString())
  if (params?.endDate) searchParams.set('endDate', params.endDate.toISOString())

  const query = searchParams.toString()
  const response = await apiClient.get<ApiResponse>(
    `/metrics${query ? `?${query}` : ''}`
  )
  return response.data
}

export async function getParcelMetrics(
  parcelId: number,
  params?: {
    page?: number
    limit?: number
    metricType?: string
    source?: 'manual' | 'api' | 'sensor' | 'calculated'
    startDate?: Date
    endDate?: Date
  }
): Promise<ApiMetric[]> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.metricType) searchParams.set('metricType', params.metricType)
  if (params?.source) searchParams.set('source', params.source)
  if (params?.startDate)
    searchParams.set('startDate', params.startDate.toISOString())
  if (params?.endDate) searchParams.set('endDate', params.endDate.toISOString())

  const query = searchParams.toString()
  const response = await apiClient.get<ApiResponse>(
    `/metrics/parcel/${parcelId}${query ? `?${query}` : ''}`
  )
  return response.data
}

export async function getMetricById(id: number): Promise<ApiMetric> {
  return apiClient.get<ApiMetric>(`/metrics/${id}`)
}

export async function createMetric(metric: {
  parcelId: number | null
  metricType: string
  value: number
  previousValue?: number | null
  unit: string
  source: 'manual' | 'api' | 'sensor' | 'calculated'
  metadata?: Record<string, any> | null
  date: Date
}): Promise<ApiMetric> {
  return apiClient.post<ApiMetric>('/metrics', metric)
}

export async function createBulkMetrics(
  metrics: Array<{
    parcelId: number | null
    metricType: string
    value: number
    previousValue?: number | null
    unit: string
    source: 'manual' | 'api' | 'sensor' | 'calculated'
    metadata?: Record<string, any> | null
    date: Date
  }>
): Promise<ApiMetric[]> {
  return apiClient.post<ApiMetric[]>('/metrics/bulk', metrics)
}

export async function updateMetric(
  id: number,
  metric: Partial<{
    parcelId: number | null
    metricType: string
    value: number
    previousValue: number | null
    unit: string
    source: 'manual' | 'api' | 'sensor' | 'calculated'
    metadata: Record<string, any> | null
    date: Date
  }>
): Promise<ApiMetric> {
  return apiClient.put<ApiMetric>(`/metrics/${id}`, metric)
}

export async function deleteMetric(id: number): Promise<void> {
  return apiClient.delete(`/metrics/${id}`)
}
