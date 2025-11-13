import { env } from '@/lib/env'

/**
 * Cliente API configurado para hacer peticiones autenticadas con credentials: 'include'
 */
class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = env.NEXT_PUBLIC_API_URL + '/' + env.NEXT_PUBLIC_API_VERSION
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    console.log(`API Request: ${options.method || 'GET'} ${url}`)

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    console.log('API Request Config:', config)

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autenticado. Por favor inicia sesión.')
        }
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Error en la petición')
      }

      return response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
