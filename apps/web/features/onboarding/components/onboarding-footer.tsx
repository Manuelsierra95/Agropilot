import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type OnboardingFooterProps = {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export function OnboardingFooter({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onNext,
  onSubmit,
}: OnboardingFooterProps) {
  const isFinalStep = currentStep === totalSteps
  const isPenultimateStep = currentStep === totalSteps - 1

  return (
    <div className="mt-10 flex items-center justify-between gap-4 border-t border-border/60 pt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 1}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all",
          currentStep === 1
            ? "pointer-events-none opacity-0"
            : "bg-muted text-foreground hover:bg-muted/80"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Atrás
      </button>

      {!isFinalStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all",
            canProceed
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {isPenultimateStep ? "Crear Parcela" : "Siguiente"}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all",
            canProceed
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          Finalizar
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
