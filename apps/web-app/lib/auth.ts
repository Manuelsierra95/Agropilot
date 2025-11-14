import { createAuthClient } from 'better-auth/react'
import { env } from '@/lib/env'

const CALLBACKURL = env.NEXT_PUBLIC_FRONTEND_URL + '/dashboard'

export const authClient: any = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL + '/auth',
  credentials: 'include',
})

export const signInWithGoogle = async () =>
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: CALLBACKURL,
  })

export const signInWithCredentials = async (email: string, password: string) =>
  await authClient.signIn.email({
    email,
    password,
    callbackURL: CALLBACKURL,
  })
