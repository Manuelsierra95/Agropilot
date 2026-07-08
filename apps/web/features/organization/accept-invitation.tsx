"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import UserAuthForm from "@workspace/web/features/auth/components/user-auth-form"
import { authClient, useSession } from "@workspace/web/lib/auth-client"
import { userApi } from "@workspace/web/lib/api/routes/user"
import {
  INVITATION_ROLE_LABELS,
  type InvitationRole,
} from "@workspace/web/features/organization/constants"

type InvitationDetails = {
  id: string
  email: string
  role: string | null
  status: string
  organizationId: string
  organizationName?: string
}

type AcceptInvitationProps = {
  invitationId: string
}

export function AcceptInvitation({ invitationId }: AcceptInvitationProps) {
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = useSession()
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const callbackURL =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${invitationId}`
      : `/invite/${invitationId}`

  useEffect(() => {
    if (!session?.user) {
      setInvitation(null)
      return
    }

    let cancelled = false
    setIsLoadingInvitation(true)
    setLoadError(null)

    void authClient.organization
      .getInvitation({ query: { id: invitationId } })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setLoadError(
            error?.message ?? "No se pudo cargar la invitación o ha expirado."
          )
          setInvitation(null)
          return
        }

        setInvitation({
          id: data.id,
          email: data.email,
          role: data.role,
          status: data.status,
          organizationId: data.organizationId,
          organizationName:
            "organizationName" in data
              ? (data.organizationName as string | undefined)
              : "organization" in data && data.organization
                ? ((data.organization as { name?: string }).name ?? undefined)
                : undefined,
        })
      })
      .finally(() => {
        if (!cancelled) setIsLoadingInvitation(false)
      })

    return () => {
      cancelled = true
    }
  }, [invitationId, session?.user])

  const sessionEmail = session?.user.email?.trim().toLowerCase()
  const invitationEmail = invitation?.email.trim().toLowerCase()
  const emailMismatch =
    Boolean(sessionEmail && invitationEmail) &&
    sessionEmail !== invitationEmail

  const roleLabel =
    invitation?.role && invitation.role in INVITATION_ROLE_LABELS
      ? INVITATION_ROLE_LABELS[invitation.role as InvitationRole]
      : (invitation?.role ?? "Miembro")

  const handleAccept = async () => {
    setActionError(null)
    setIsAccepting(true)

    try {
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId,
      })

      if (error || !data) {
        throw new Error(error?.message ?? "No se pudo aceptar la invitación.")
      }

      const organizationId =
        "organizationId" in data
          ? (data.organizationId as string)
          : invitation?.organizationId

      if (organizationId) {
        const { error: activeError } = await authClient.organization.setActive({
          organizationId,
        })
        if (activeError) {
          throw new Error(
            activeError.message ?? "No se pudo activar la organización."
          )
        }
      }

      try {
        await userApi.updateOnboarding(5)
      } catch {
        // Invited users may already have completed onboarding.
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No se pudo aceptar la invitación."
      )
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    setActionError(null)
    setIsRejecting(true)

    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      })

      if (error) {
        throw new Error(error.message ?? "No se pudo rechazar la invitación.")
      }

      router.push("/")
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No se pudo rechazar la invitación."
      )
    } finally {
      setIsRejecting(false)
    }
  }

  if (isSessionPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Te han invitado a Agropilot</CardTitle>
            <CardDescription>
              Inicia sesión con el correo al que se envió la invitación para
              unirte a la organización.
            </CardDescription>
          </CardHeader>
        </Card>
        <UserAuthForm
          title="Inicia sesión"
          subtitle="Usa la misma cuenta de correo que recibió la invitación."
          callbackURL={callbackURL}
        />
      </div>
    )
  }

  if (isLoadingInvitation) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (loadError || !invitation) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invitación no disponible</CardTitle>
            <CardDescription>
              {loadError ??
                "La invitación no existe, ya fue usada o ha expirado."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Ir al panel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (emailMismatch) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Correo no coincidente</CardTitle>
            <CardDescription>
              Esta invitación es para <strong>{invitation.email}</strong>, pero
              has iniciado sesión como <strong>{session.user.email}</strong>.
              Cierra sesión e inicia con el correo invitado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Únete a la organización</CardTitle>
          <CardDescription>
            Has sido invitado a unirte a{" "}
            <strong>{invitation.organizationName ?? "una organización"}</strong>{" "}
            en Agropilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">{invitation.email}</Badge>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>

          {actionError ? (
            <p className="text-center text-sm text-destructive" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => void handleAccept()}
              disabled={isAccepting || isRejecting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aceptando...
                </>
              ) : (
                "Aceptar invitación"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => void handleReject()}
              disabled={isAccepting || isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                "Rechazar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
