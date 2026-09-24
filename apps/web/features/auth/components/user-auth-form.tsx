"use client"

import GoogleSignInButton from "@workspace/web/features/auth/components/google-auth-button"
import GithubSignInButton from "@workspace/web/features/auth/components/github-auth-button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { env } from "@workspace/web/lib/env"
import { isDemoMode } from "@workspace/web/lib/demo-mode"

export interface UserAuthFormProps {
  company?: React.ReactNode
  logo?: React.ReactNode
  title?: string
  subtitle?: string
  callbackURL?: string
}

export default function UserAuthForm({
  company,
  logo,
  title,
  subtitle,
  callbackURL,
}: UserAuthFormProps) {
  const router = useRouter()
  const resolvedCallbackURL =
    callbackURL ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/onboarding`
      : env.PUBLIC_REDIRECT_URL)

  const demo = isDemoMode()

  function handleDemoSignIn() {
    if (typeof window !== "undefined") {
      document.cookie = `demo-mode=true; Path=/; Max-Age=86400; SameSite=Lax`
    }
    toast.success("Modo demo: entrando como usuario de demostración")
    router.push("/dashboard")
  }

  if (demo) {
    return (
      <div className="w-full space-y-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 self-center font-medium"
        >
          {logo} {company}
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  className="h-12 w-full rounded-full text-base"
                  onClick={handleDemoSignIn}
                >
                  Entrar al modo demo
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Esta demo usa datos simulados. No se enviará ningún email ni
                  se conectará a Google.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="px-6 text-center text-xs leading-relaxed text-pretty text-muted-foreground">
          Al continuar aceptas nuestros{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terminos de Servicio
          </Link>{" "}
          y{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Politica de Privacidad
          </Link>
          .
        </footer>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 self-center font-medium"
      >
        {logo} {company}
      </Link>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <GoogleSignInButton
                label="Entrar con Google"
                callbackURL={resolvedCallbackURL}
              />
              <GithubSignInButton
                label="Entrar con GitHub"
                callbackURL={resolvedCallbackURL}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="px-6 text-center text-xs leading-relaxed text-pretty text-muted-foreground">
        Al continuar aceptas nuestros{" "}
        <Link
          href="/terms"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Terminos de Servicio
        </Link>{" "}
        y{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Politica de Privacidad
        </Link>
        .
      </footer>
    </div>
  )
}
