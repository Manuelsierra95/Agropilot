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
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {!isUnlimited && (
          <div
            className={`h-full rounded-full transition-all ${isWarn ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
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
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-medium">Facturación</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona tu plan, suscripción y módulos adicionales.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Suscripción</h3>

        {subscription ? (
          <div className="divide-y rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Estado</span>
              <Badge
                variant={STATUS_VARIANTS[subscription.status] ?? "secondary"}
              >
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Periodo actual
              </span>
              <span className="text-sm">
                {fmt(subscription.currentPeriodStart)} →{" "}
                {fmt(subscription.currentPeriodEnd)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Cancelación programada
              </span>
              <span className="text-sm">
                {subscription.cancelAtPeriodEnd
                  ? "Sí, al fin del periodo"
                  : "No"}
              </span>
            </div>
            {subscription.trialEndsAt && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Prueba hasta
                </span>
                <span className="text-sm">{fmt(subscription.trialEndsAt)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sin suscripción activa. Estás en el plan gratuito.
            </p>
            <Button size="sm" className="mt-3">
              Actualizar plan
            </Button>
          </div>
        )}

        {subscription && (
          <div className="flex gap-2">
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
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Uso del plan</h3>

        <div className="divide-y rounded-lg border">
          <div className="space-y-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Parcelas</span>
              <span className="text-sm font-medium">
                {fmtLimit(limits.usedParcels, limits.maxParcels)}
              </span>
            </div>
            <UsageBar used={limits.usedParcels} max={limits.maxParcels} />
          </div>
          <div className="space-y-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Miembros</span>
              <span className="text-sm font-medium">
                {fmtLimit(limits.usedMembers, limits.maxMembers)}
              </span>
            </div>
            <UsageBar used={limits.usedMembers} max={limits.maxMembers} />
          </div>
          <div className="space-y-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Almacenamiento
              </span>
              <span className="text-sm font-medium">
                {fmtLimit(limits.usedStorageMb, limits.maxStorageMb)} MB
              </span>
            </div>
            <UsageBar used={limits.usedStorageMb} max={limits.maxStorageMb} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Módulos</h3>

        <div className="divide-y rounded-lg border">
          {modules.map((mod) => {
            const label = MODULE_LABELS[mod.slug]
            const isComingSoon = mod.status === "coming_soon"

            return (
              <div
                key={mod.id}
                className="flex items-center justify-between px-4 py-4"
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
      </section>
    </div>
  )
}
