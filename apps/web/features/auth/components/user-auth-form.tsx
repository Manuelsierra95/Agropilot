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

export interface UserAuthFormProps {
  company?: string
  logo?: React.ReactNode
  title?: string
  subtitle?: string
}

export default function UserAuthForm({
  company,
  logo,
  title,
  subtitle,
}: UserAuthFormProps) {
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
              <GoogleSignInButton label="Entrar con Google" />
              <GithubSignInButton label="Entrar con GitHub" />
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
