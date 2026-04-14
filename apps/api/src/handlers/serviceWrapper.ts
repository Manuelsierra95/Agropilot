import { ErrorCode } from "./errors"

export type ApiSuccess<T> = {
  data: T
  timestamp: string
}

export type ApiError = {
  error: ErrorCode
  details?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

type ServiceWrapperOptions<T> = {
  operation: () => Promise<T>
  onNotFound?: (result: T) => boolean
}

export async function serviceWrapper<T>(
  options: ServiceWrapperOptions<T>
): Promise<ApiResponse<T>> {
  try {
    const result = await options.operation()

    if (options.onNotFound?.(result)) {
      return {
        error: "PARCEL_NOT_FOUND",
      }
    }

    return {
      data: result,
      timestamp: new Date().toISOString(),
    }
  } catch (e) {
    if (typeof e === "object" && e !== null && "code" in e) {
      const err = e as { code: ErrorCode; message?: string }

      return {
        error: err.code,
        details: err.message,
      }
    }

    return {
      error: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    }
  }
}
