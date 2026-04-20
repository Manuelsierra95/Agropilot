import { MapPin } from "lucide-react"

type OnboardingStepOneProps = {
  parcelName: string
  onParcelNameChange: (value: string) => void
}

export function OnboardingStepOne({
  parcelName,
  onParcelNameChange,
}: OnboardingStepOneProps) {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        Crear nueva parcela
      </h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Dibuja tu parcela en el mapa o introduce las coordenadas. El fondo y las
        superficies se adaptan al modo claro u oscuro con una paleta neutra.
      </p>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Nombre de la parcela
        </label>
        <input
          type="text"
          value={parcelName}
          onChange={(e) => onParcelNameChange(e.target.value)}
          placeholder="Ej: Parcela Norte, Finca del Olivo..."
          className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground/80 focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10 focus:outline-none"
        />
      </div>

      <div className="relative flex h-75 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/80 bg-[linear-gradient(180deg,hsl(var(--muted)/0.7),hsl(var(--background)/0.9))]">
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
        <MapPin className="relative z-10 mb-4 h-12 w-12 text-emerald-600/70 dark:text-emerald-400/70" />
        <span className="relative z-10 text-lg font-medium text-foreground">
          Mapa de parcelas
        </span>
        <span className="relative z-10 mt-2 text-sm text-muted-foreground">
          Aquí irá el componente de mapa
        </span>
      </div>
    </div>
  )
}
