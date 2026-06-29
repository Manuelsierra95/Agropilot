import type { ApiMeta, ApiPagination } from "@workspace/schemas"

type ApiResponseParams<T> = {
  data: T
  meta: Omit<ApiMeta, "from" | "to"> & { from?: string; to?: string }
  pagination?: ApiPagination
}

export type ApiResponse<T> = {
  meta: ApiMeta
  data: T
  pagination?: ApiPagination
}

export function apiResponse<T>(params: ApiResponseParams<T>): ApiResponse<T> {
  return {
    meta: params.meta,
    data: params.data,
    ...(params.pagination ? { pagination: params.pagination } : {}),
  }
}
