export type ErrorCode =
  | "PARCEL_NOT_FOUND"
  | "INVALID_ADDRESS"
  | "INVALID_COORDS"
  | "EXTERNAL_SERVICE_ERROR"
  | "INTERNAL_ERROR"

class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ParcelNotFoundError extends AppError {
  constructor(message?: string) {
    super("PARCEL_NOT_FOUND", message ?? "Parcel not found")
  }
}

export class InvalidAddressError extends AppError {
  constructor(message?: string) {
    super("INVALID_ADDRESS", message ?? "Invalid address")
  }
}

export class InvalidCoordsError extends AppError {
  constructor(message?: string) {
    super("INVALID_COORDS", message ?? "Invalid coordinates")
  }
}

export class ExternalServiceError extends AppError {
  constructor(message?: string) {
    super("EXTERNAL_SERVICE_ERROR", message ?? "External service failed")
  }
}
