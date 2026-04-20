"use client"

import GoogleSignInButton from "./google-auth-button"
import GithubSignInButton from "./github-auth-button"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { env } from "@/lib/env"

export interface UserAuthFormProps {
  company?: string
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
  const resolvedCallbackURL =
    callbackURL ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/onboarding`
      : env.PUBLIC_REDIRECT_URL)

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
