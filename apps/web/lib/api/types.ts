import type { InferResponseType } from "hono/client"

type ApiMethod = (...args: unknown[]) => Promise<Response>

export type ApiResponse<T extends ApiMethod> = InferResponseType<T, 200>

export async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as unknown as T
}
