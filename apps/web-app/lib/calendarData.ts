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
}): Promise<ApiEvent[]> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.category) searchParams.set('category', params.category)
  if (params?.isRead !== undefined)
    searchParams.set('isRead', params.isRead.toString())
  if (params?.todayEvents !== undefined)
    searchParams.set('todayEvents', params.todayEvents.toString())

  const query = searchParams.toString()
  const response = await apiClient.post<ApiResponse>(
    `/events${query ? `?${query}` : ''}`
  )
  return response.data
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
): Promise<ApiEvent[]> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.category) searchParams.set('category', params.category)
  if (params?.isRead !== undefined)
    searchParams.set('isRead', params.isRead.toString())
  if (params?.todayEvents !== undefined)
    searchParams.set('todayEvents', params.todayEvents.toString())

  const query = searchParams.toString()
  const response = await apiClient.post<ApiResponse>(
    `/events/parcel/${parcelId}${query ? `?${query}` : ''}`
  )
  return response.data
}

export async function getTodayParcelEvents(
  parcelId: number | 'all',
  params?: {
    page?: number
    limit?: number
    category?: string
    isRead?: 0 | 1
  }
): Promise<ApiEvent[]> {
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
): Promise<ApiEvent[]> {
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
}): Promise<ApiEvent> {
  return apiClient.post<ApiEvent>('/events', event)
}
