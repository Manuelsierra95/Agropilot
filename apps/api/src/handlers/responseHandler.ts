interface ServiceErrorResponse {
  error: string
  status?: number
  [key: string]: any
}

interface ServiceSuccessResponse {
  error?: undefined
  status?: number
  [key: string]: any
}

type ServiceResponse = ServiceErrorResponse | ServiceSuccessResponse

interface Context {
  json: (body: any, status?: number) => any
}

export function handleServiceResponse(c: Context, res: ServiceResponse): any {
  if (res.error) {
    return c.json(res, res.status || 500)
  }
  return c.json(res, res.status || 200)
}
