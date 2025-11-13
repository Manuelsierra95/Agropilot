'use client'

import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export interface Session {
  user: {
    id: string
    email: string
    name?: string
    image?: string
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
  } | null
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string
    userAgent?: string
  } | null
}

/**
 * Hook para obtener la sesión actual del usuario
 * Utiliza el hook nativo de better-auth que incluye caché automático
 * @param options - Opciones del hook
 * @param options.requireAuth - Si es true, redirige a /login si no está autenticado
 * @returns {Session | null} La sesión del usuario o null si no está autenticado
 */
export function useSession(options?: { requireAuth?: boolean }) {
  const { data: session, isPending: loading } = authClient.useSession()
  const router = useRouter()
  const requireAuth = options?.requireAuth ?? false

  if (requireAuth && !loading && !session?.user) {
    router.push('/login')
  }

  return {
    session: session || null,
    loading,
    isAuthenticated: !!session?.user,
  }
}
