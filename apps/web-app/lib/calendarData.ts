import { apiClient } from '@/lib/apiClient'

export type Event = {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  color: string
  category: string
  tags: string[]
}

type EventResponse = {
  data?: ApiEvent[]
  status: number
  error: string | null
}

type ApiEvent = {
  id: number
  userId: string
  parcelId: number
  title: string
  description?: string
  startTime: string
  endTime: string
  category: string
  color: string
  tags?: string[]
  isRead: number
  createdAt: string
  updatedAt: string
}

type ApiResponse = {
  message: string
  timestamp: string
  status: number
  data: ApiEvent[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getUserEvents(params?: {
  page?: number
  limit?: number
  category?: string
  isRead?: 0 | 1
  todayEvents?: 0 | 1
}): Promise<EventResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.category) searchParams.set('category', params.category)
  if (params?.isRead !== undefined)
    searchParams.set('isRead', params.isRead.toString())
  if (params?.todayEvents !== undefined)
    searchParams.set('todayEvents', params.todayEvents.toString())

  const query = searchParams.toString()
  const { data, status, error } = await apiClient.get<ApiResponse>(
    `/events${query ? `?${query}` : ''}`
  )
  return { data: data?.data ?? [], status, error: error ?? null }
}

export async function getParcelEvents(
  parcelId: number,
  params?: {
    page?: number
    limit?: number
    category?: string
    isRead?: 0 | 1
    todayEvents?: 0 | 1
  }
): Promise<EventResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.category) searchParams.set('category', params.category)
  if (params?.isRead !== undefined)
    searchParams.set('isRead', params.isRead.toString())
  if (params?.todayEvents !== undefined)
    searchParams.set('todayEvents', params.todayEvents.toString())

  const query = searchParams.toString()
  const { data, status, error } = await apiClient.get<ApiResponse>(
    `/events/parcel/${parcelId}${query ? `?${query}` : ''}`
  )

  return { data: data?.data ?? [], status, error: error ?? null }
}

export async function getTodayParcelEvents(
  parcelId: number | 'all',
  params?: {
    page?: number
    limit?: number
    category?: string
    isRead?: 0 | 1
  }
): Promise<EventResponse> {
  if (parcelId === 'all') {
    return getUserEvents({ ...params, todayEvents: 1 })
  }
  return getParcelEvents(parcelId, { ...params, todayEvents: 1 })
}

export async function getAllParcelEvents(
  parcelId: number | 'all',
  params?: {
    page?: number
    limit?: number
    category?: string
    isRead?: 0 | 1
  }
): Promise<EventResponse> {
  if (parcelId === 'all') {
    return getUserEvents(params)
  }
  return getParcelEvents(parcelId, params)
}

export async function createEvent(event: {
  type: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  parcelId: number
}): Promise<{ data: ApiEvent | null; status: number; error: string | null }> {
  const { data, status, error } = await apiClient.post<ApiEvent>(
    '/events',
    event
  )
  return { data, status, error: error ?? null }
}
