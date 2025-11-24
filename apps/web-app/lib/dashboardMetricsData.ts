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

type GroupedMetricsData = {
  olive_price?: ApiMetric[]
  crop_health?: ApiMetric[]
  yield_estimate?: ApiMetric[]
  rainfall?: ApiMetric[]
  current_weather?: ApiMetric[]
  current_weather_temperature?: ApiMetric[]
  current_weather_humidity?: ApiMetric[]
  current_weather_wind?: ApiMetric[]
  previous_harvest?: ApiMetric[]
}

type ApiResponse = {
  message: string
  timestamp: string
  status: number
  data: GroupedMetricsData & {
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

/**
 * Obtiene las métricas más recientes de una parcela específica
 * @param parcelId - ID de la parcela
 * @param metricTypes - Array de tipos de métricas a obtener
 * @param params - Parámetros de paginación
 */
export async function getParcelLatestMetrics(
  parcelId: number,
  metricTypes: string[],
  params?: {
    page?: number
    limit?: number
  }
) {
  return getDashboardMetricsData('parcel', parcelId, metricTypes, params)
}

/**
 * Obtiene las métricas más recientes del usuario (todas las parcelas)
 * @param metricTypes - Array de tipos de métricas a obtener
 * @param params - Parámetros de paginación
 */
export async function getUserLatestMetrics(
  metricTypes: string[],
  params?: {
    page?: number
    limit?: number
  }
) {
  return getDashboardMetricsData('user', 0, metricTypes, params)
}

function buildMetricsQuery(
  metricTypes: string[],
  params?: { page?: number; limit?: number }
): string {
  const searchParams = new URLSearchParams()

  if (metricTypes.length > 0) {
    searchParams.set('metricTypes', metricTypes.join(','))
  }
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

async function getDashboardMetricsData(
  type: 'user' | 'parcel',
  parcelId: number,
  metricTypes: string[],
  params?: {
    page?: number
    limit?: number
  }
): Promise<{
  data: GroupedMetricsData & {
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
  status: number
  error: string | null
}> {
  const query = buildMetricsQuery(metricTypes, params)
  const basePath =
    type === 'parcel'
      ? `/metrics/parcel/${parcelId}/latests`
      : `/metrics/latests`

  const { data, status, error } = await apiClient.get<ApiResponse>(
    `${basePath}${query}`
  )
  return { data: data?.data ?? {}, status, error: error ?? null }
}
