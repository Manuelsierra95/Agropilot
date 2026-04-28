"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import type { BillingMeResponse } from "@workspace/schemas"

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  trialing: "Periodo de prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impagada",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive"> =
  {
    active: "default",
    trialing: "secondary",
    past_due: "destructive",
    canceled: "destructive",
    unpaid: "destructive",
  }

const MODULE_LABELS: Record<string, { name: string; description: string }> = {
  "ai-analysis": {
    name: "Análisis IA",
    description: "Recomendaciones de riego, tratamientos y venta.",
  },
  "field-notebook": {
    name: "Cuaderno de campo",
    description: "Registro de faenas y trazabilidad por parcela.",
  },
  automations: {
    name: "Automatizaciones",
    description: "Alertas y flujos de decisión automáticos.",
  },
}

function UsageBar({ used, max }: { used: number; max: number }) {
  const isUnlimited = max === -1
  const pct = isUnlimited ? 0 : Math.min((used / max) * 100, 100)
  const isWarn = pct > 80

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      {!isUnlimited && (
        <div
          className={`h-full rounded-full transition-all ${isWarn ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  )
}

export function SettingsBillingSection({
  billing,
}: {
  billing: BillingMeResponse
}) {
  const { subscription, limits, modules } = billing

  const fmt = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—"

  const fmtLimit = (used: number, max: number) =>
    max === -1 ? `${used} / ∞` : `${used} / ${max}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Facturación</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona tu plan, suscripción y módulos adicionales.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
        {/* ── Left column: subscription + actions ── */}
        <div className="flex flex-col gap-6 pr-8">
          {/* Subscription header card */}
          {subscription ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Suscripción</p>
                  <Badge
                    variant={
                      STATUS_VARIANTS[subscription.status] ?? "secondary"
                    }
                    className="w-fit text-xs"
                  >
                    {STATUS_LABELS[subscription.status] ?? subscription.status}
                  </Badge>
                </div>
              </div>

              {/* Subscription detail cards */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-muted/40 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Inicio</p>
                    <p className="mt-1 text-sm font-medium">
                      {fmt(subscription.currentPeriodStart)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Fin de periodo
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {fmt(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {subscription.trialEndsAt && (
                  <div className="rounded-lg border bg-muted/40 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Prueba hasta
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {fmt(subscription.trialEndsAt)}
                    </p>
                  </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Cancelación</p>
                    <p className="mt-1 text-sm font-medium text-destructive">
                      Al fin del periodo actual
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t pt-4">
                <Button variant="outline" size="sm">
                  Gestionar en Stripe →
                </Button>
                {!subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    Cancelar suscripción
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Sin suscripción activa</p>
                  <Badge variant="secondary" className="w-fit text-xs">
                    Plan gratuito
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Actualiza tu plan para desbloquear más parcelas, miembros y
                módulos adicionales.
              </p>

              <div className="flex items-center gap-3 border-t pt-4">
                <Button>Actualizar plan</Button>
              </div>
            </>
          )}
        </div>

        {/* ── Right column: usage + modules ── */}
        <div className="flex flex-col gap-6 pl-8">
          {/* Usage */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Uso del plan
            </p>

            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Parcelas",
                  used: limits.usedParcels,
                  max: limits.maxParcels,
                },
                {
                  label: "Miembros",
                  used: limits.usedMembers,
                  max: limits.maxMembers,
                },
                {
                  label: "Almacenamiento",
                  used: limits.usedStorageMb,
                  max: limits.maxStorageMb,
                  unit: "MB",
                },
              ].map(({ label, used, max, unit }) => (
                <div
                  key={label}
                  className="space-y-2 rounded-lg border bg-muted/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-xs font-medium">
                      {fmtLimit(used, max)}
                      {unit ? ` ${unit}` : ""}
                    </span>
                  </div>
                  <UsageBar used={used} max={max} />
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="flex flex-col gap-3 border-t pt-4">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Módulos
            </p>

            <div className="divide-y rounded-lg border">
              {modules.map((mod) => {
                const label = MODULE_LABELS[mod.slug]
                const isComingSoon = mod.status === "coming_soon"

                return (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {label?.name ?? mod.name}
                        </p>
                        {isComingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Próximamente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {label?.description ?? mod.description}
                      </p>
                    </div>

                    <Button
                      variant={mod.active ? "outline" : "default"}
                      size="sm"
                      disabled={isComingSoon}
                      className="ml-4 shrink-0"
                    >
                      {mod.active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
