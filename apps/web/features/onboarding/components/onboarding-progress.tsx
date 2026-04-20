import { motion } from "framer-motion"

type OnboardingProgressProps = {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  const stepLabel =
    currentStep === 1
      ? "Datos basicos"
      : currentStep === 2
        ? "Cultivo y riego"
        : "Resumen"

  return (
    <div className="mb-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          {stepLabel}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-foreground via-foreground/80 to-foreground/40"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}
