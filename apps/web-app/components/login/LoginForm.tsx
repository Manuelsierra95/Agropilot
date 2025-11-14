'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import {
  Field,
  FieldGroup,
  FieldSeparator,
} from '@workspace/ui/components/field'
import { Loader2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { signInWithGoogle, signInWithCredentials } from '@/lib/auth'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión con Google'
      )
      setIsGoogleLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    try {
      setIsGuestLoading(true)
      await signInWithCredentials('demo@example.com', 'demo1234')
      toast.success('Sesión iniciada como invitado')
      // router.push('/dashboard')
      // router.refresh()
    } catch (error) {
      console.error('Error al iniciar como invitado:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión como invitado'
      )
      setIsGuestLoading(false)
    }
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={(e) => e.preventDefault()}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Inicio de sesión</h1>
          <p className="text-sm text-muted-foreground text-balance">
            Inicia sesión con Google o haz click en el botón de invitado
          </p>
        </div>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isGuestLoading}
            className="w-full"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Iniciar con Google
          </Button>
        </Field>
        <FieldSeparator>O continúa como</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGuestLogin}
            disabled={isGoogleLoading || isGuestLoading}
            className="w-full"
          >
            {isGuestLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <User className="mr-2 h-4 w-4" />
            )}
            Iniciar como invitado
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
