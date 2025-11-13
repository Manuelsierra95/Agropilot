type ApiResponse<T> = {
  message?: string
  timestamp?: string
  status: number
  data?: T
  count?: number
  pagination?: PaginationInfo
  error?: string
  details?: string
}

type PaginationInfo = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type PaginatedResult<T> = {
  data: T[]
  pagination: PaginationInfo
}

type ServiceWrapperOptions<T> = {
  operation: () => Promise<T>
  success: {
    message: string
    status?: number
  }
  error: {
    message: string
    status?: number
  }
  onNotFound?: {
    condition: (result: T) => boolean
    message: string
    details: string
    status?: number
  }
}

function isPaginatedResult<T>(result: any): result is PaginatedResult<T> {
  return (
    result &&
    typeof result === 'object' &&
    Array.isArray(result.data) &&
    result.pagination &&
    typeof result.pagination === 'object' &&
    typeof result.pagination.currentPage === 'number'
  )
}

export async function serviceWrapper<T>(
  options: ServiceWrapperOptions<T>
): Promise<ApiResponse<T>> {
  try {
    const result = await options.operation()

    if (options.onNotFound && options.onNotFound.condition(result)) {
      return {
        error: options.onNotFound.message,
        details: options.onNotFound.details,
        status: options.onNotFound.status ?? 404,
      }
    }

    // With pagination structure
    if (isPaginatedResult(result)) {
      return {
        message: options.success.message,
        timestamp: new Date().toISOString(),
        status: options.success.status ?? 200,
        data: result.data as T,
        pagination: result.pagination,
      }
    }

    // With regular (non-paginated) structure
    return {
      message: options.success.message,
      timestamp: new Date().toISOString(),
      status: options.success.status ?? 200,
      data: result,
      count: Array.isArray(result) ? (result as unknown[]).length : undefined,
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return {
      error: options.error.message,
      details: error,
      status: options.error.status ?? 500,
    }
  }
}
