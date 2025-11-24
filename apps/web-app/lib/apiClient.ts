import { env } from '@/lib/env'

/**
 * Cliente API configurado para hacer peticiones autenticadas con credentials: 'include'
 */
type ApiResponse<T> = { data: T; status: number; error: string | null }

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL + '/' + env.NEXT_PUBLIC_API_VERSION
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }

    let error: string | null = null
    let data: any = null
    let status: number = 0
    try {
      const response = await fetch(url, config)
      status = response.status
      data = await response.json().catch(() => null)
      if (!response.ok) {
        if (status === 401) {
          error = 'No autenticado. Por favor inicia sesión.'
        } else {
          error = data?.error || 'Error en la petición'
        }
      }
    } catch (err: any) {
      console.error('API Error:', err)
      error = err?.message || 'Error de red o inesperado'
    }
    return { data, status, error }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
