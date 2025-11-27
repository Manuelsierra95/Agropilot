import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { env } from '@/lib/env'

export const getSession = async ({
  redirectToLogin = true,
  currentPath = '/',
}: {
  redirectToLogin?: boolean
  currentPath?: string
}) => {
  const h = await headers()
  const cookieHeader = h.get('cookie') || ''

  let session = null

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/get-session`, {
      headers: { cookie: cookieHeader },
      credentials: 'include',
    })

    if (res.ok) session = await res.json()
    else console.error('Error fetching session:', res.status, await res.text())
  } catch (err) {
    console.error('Error fetching session:', err)
  }

  // Si el usuario ya está logueado y está en / → redirigir a /dashboard
  if (!redirectToLogin && session?.user && currentPath !== '/dashboard') {
    redirect('/dashboard')
  }

  // Si el usuario no está logueado y se requiere login → redirigir a /login
  if (redirectToLogin && !session?.user) {
    redirect('/login')
  }

  return session
}
