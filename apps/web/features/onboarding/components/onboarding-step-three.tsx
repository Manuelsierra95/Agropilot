import { MapPin } from "lucide-react"

type Parcel = {
  id: string
  name: string
  crop: string
  irrigation: string
  irrigationSystem: string
  soilType: string
  size: string
}

type OnboardingStepThreeProps = {
  parcels: Parcel[]
  onAddAnotherParcel: () => void
}

export function OnboardingStepThree({
  parcels,
  onAddAnotherParcel,
}: OnboardingStepThreeProps) {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        Resumen de parcelas
      </h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Revisa todas las parcelas creadas antes de finalizar o añade más.
      </p>

      {parcels.length > 0 ? (
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          {parcels.map((parcel) => {
            const irrigationSummary =
              parcel.irrigation === "secano"
                ? "Secano"
                : parcel.irrigation === "riego"
                  ? `Riego (${parcel.irrigationSystem || "Sin sistema"})`
                  : "No definido"

            const parcelSizeSummary =
              parcel.size.trim() === "" ? "No indicada" : `${parcel.size} ha`
            const soilSummary = parcel.soilType || "No especificado"

            return (
              <div
                key={parcel.id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-background/70"
              >
                {/* Map Preview */}
                <div className="relative flex h-40 w-full flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,hsl(var(--muted)/0.5),hsl(var(--background)/0.8))]">
                  <div className="absolute inset-0 opacity-70 dark:opacity-60">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--foreground)/0.06),transparent_48%),radial-gradient(circle_at_bottom_right,hsl(var(--foreground)/0.05),transparent_36%)] dark:bg-[radial-gradient(circle_at_center,hsl(var(--foreground)/0.08),transparent_48%),radial-gradient(circle_at_bottom_right,hsl(var(--foreground)/0.06),transparent_36%)]" />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                          linear-gradient(hsl(var(--border) / 0.45) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--border) / 0.45) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                      }}
                    />
                  </div>
                  <MapPin className="relative z-10 mb-2 h-8 w-8 text-emerald-600/70 dark:text-emerald-400/70" />
                  <span className="relative z-10 text-sm font-medium text-foreground">
                    Mapa de {parcel.name}
                  </span>
                </div>

                {/* Details */}
                <dl className="divide-y divide-border/60">
                  <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Nombre
                    </dt>
                    <dd className="text-sm text-foreground">{parcel.name}</dd>
                  </div>

                  <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Cultivo
                    </dt>
                    <dd className="text-sm text-foreground">{parcel.crop}</dd>
                  </div>

                  <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Riego
                    </dt>
                    <dd className="text-sm text-foreground">
                      {irrigationSummary}
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Suelo
                    </dt>
                    <dd className="text-sm text-foreground">{soilSummary}</dd>
                  </div>

                  <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Superficie
                    </dt>
                    <dd className="text-sm text-foreground">
                      {parcelSizeSummary}
                    </dd>
                  </div>
                </dl>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-border/80 bg-muted/30 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No hay parcelas creadas aún
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onAddAnotherParcel}
        className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Seguir anadiendo parcelas
      </button>
    </div>
  )
}
