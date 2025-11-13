import { createAuthClient } from 'better-auth/react'
import { env } from '@/lib/env'

export const authClient: any = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL + '/auth',
  credentials: 'include',
})

export const signInWithGoogle = async () =>
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: env.NEXT_PUBLIC_FRONTEND_URL + '/dashboard',
  })
