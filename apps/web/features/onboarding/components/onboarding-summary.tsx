"use client"

import { useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { client } from "@/lib/api/client"
import { formatCurrency } from "@/features/finance/table/helpers"
import {
  CROP_TYPE_LABELS,
  IRRIGATION_TYPE_LABELS,
  type CropTypeValue,
} from "./parcel/parcel-constants"
import type { FieldFormData } from "./parcel"
import {
  TEAM_ROLE_LABELS,
  type FinanceBulkRow,
  type TeamInviteDraft,
} from "../mocks/onboarding-mocks"
import { CheckCircle2, Euro, MapPin, Users } from "lucide-react"

const ONBOARDING_COMPLETE_STEP = 4

interface OnboardingSummaryProps {
  parcels: FieldFormData[]
  financeRows: FinanceBulkRow[]
  teamInvites: TeamInviteDraft[]
  onEditParcels?: () => void
}

export function OnboardingSummary({
  parcels,
  financeRows,
  teamInvites,
  onEditParcels,
}: OnboardingSummaryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const validInvites = useMemo(
    () => teamInvites.filter((invite) => invite.email.trim().length > 0),
    [teamInvites]
  )

  const financeTotals = useMemo(() => {
    const income = financeRows
      .filter((row) => row.flow === "income")
      .reduce((sum, row) => sum + row.amount, 0)
    const expense = financeRows
      .filter((row) => row.flow === "expense")
      .reduce((sum, row) => sum + row.amount, 0)
    return { income, expense, count: financeRows.length }
  }, [financeRows])

  const parcelCountLabel =
    parcels.length === 1 ? "1 parcela" : `${parcels.length} parcelas`

  const handleFinish = () => {
    startTransition(async () => {
      try {
        await client.api.v1.user.me.$patch({
          json: { onboardingStep: ONBOARDING_COMPLETE_STEP },
        })
      } catch {
        // Redirigimos igual: el proxy volverá a onboarding si el estado no se guardó
      }
      router.push("/dashboard")
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
              <span className="text-sm font-medium">Casi listo</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Resumen de tu configuración
            </h1>
            <p className="text-muted-foreground">
              Revisa lo que has añadido en el onboarding. Podrás editarlo más
              tarde desde el panel.
            </p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">Parcelas</CardTitle>
                </div>
                <Badge>{parcelCountLabel}</Badge>
              </div>
              <CardDescription>
                {parcels.length === 1
                  ? "Tu primera explotación en Agropilot"
                  : "Tus explotaciones en Agropilot"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-2">
                {parcels.map((parcel) => {
                  const parcelName = parcel.name.trim() || "Parcela sin nombre"
                  const cropLabel =
                    CROP_TYPE_LABELS[
                      (parcel.cropType ?? "olivar") as CropTypeValue
                    ]
                  const irrigationLabel = parcel.irrigationType
                    ? IRRIGATION_TYPE_LABELS[parcel.irrigationType]
                    : null

                  return (
                    <li
                      key={parcel.id}
                      className="space-y-2 rounded-lg border bg-muted/30 px-3 py-3"
                    >
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-foreground">
                          {parcelName}
                        </span>
                        <span className="text-muted-foreground">
                          {cropLabel}
                        </span>
                      </div>
                      {irrigationLabel ? (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Riego</span>
                          <span className="font-medium text-foreground">
                            {irrigationLabel}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Mapa</span>
                        <span className="font-medium text-foreground">
                          {parcel.polygon ? "Delimitada" : "Sin delimitar"}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
              {onEditParcels ? (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={onEditParcels}
                >
                  ¿Falta alguna parcela? Añadir o editar
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-muted-foreground" aria-hidden />
                  <CardTitle className="text-base">Finanzas</CardTitle>
                </div>
                <Badge
                  variant={financeTotals.count > 0 ? "default" : "secondary"}
                >
                  {financeTotals.count > 0
                    ? `${financeTotals.count} movimientos`
                    : "Omitido"}
                </Badge>
              </div>
              <CardDescription>Importación masiva desde Excel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {financeTotals.count > 0 ? (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Ingresos</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatCurrency(financeTotals.income)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Gastos</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatCurrency(financeTotals.expense)}
                    </span>
                  </div>
                  <Separator />
                  <p className="text-muted-foreground">
                    Los movimientos se importarán al entrar en el panel de
                    finanzas.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No has importado movimientos. Puedes hacerlo más tarde desde
                  Finanzas.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden
                  />
                  <CardTitle className="text-base">Equipo</CardTitle>
                </div>
                <Badge
                  variant={validInvites.length > 0 ? "default" : "secondary"}
                >
                  {validInvites.length > 0
                    ? validInvites.length === 1
                      ? "1 invitación"
                      : `${validInvites.length} invitaciones`
                    : "Omitido"}
                </Badge>
              </div>
              <CardDescription>Invitaciones por correo</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              {validInvites.length > 0 ? (
                <ul className="space-y-2">
                  {validInvites.map((invite) => (
                    <li
                      key={invite.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <span className="font-medium text-foreground">
                        {invite.email}
                      </span>
                      <span className="text-muted-foreground">
                        {TEAM_ROLE_LABELS[invite.role]}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No has añadido invitaciones. Podrás invitar a tu equipo desde
                  la configuración de la organización.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border-t border-sidebar-border bg-sidebar px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isPending}
            onClick={handleFinish}
          >
            {isPending ? "Entrando al panel…" : "Ir al panel"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Al continuar, marcaremos el onboarding como completado.
          </p>
        </div>
      </div>
    </div>
  )
}
