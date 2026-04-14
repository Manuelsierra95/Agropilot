interface ServiceErrorResponse {
  error: string
  [key: string]: any
}

interface ServiceSuccessResponse {
  error?: undefined
  [key: string]: any
}

type ServiceResponse = ServiceErrorResponse | ServiceSuccessResponse

interface Context {
  json: (body: any) => any
}

export function handleServiceResponse(c: Context, res: ServiceResponse): any {
  if (res.error) {
    return c.json(res)
  }
  return c.json(res)
}
