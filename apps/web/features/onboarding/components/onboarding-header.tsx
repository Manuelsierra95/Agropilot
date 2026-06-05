import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface OnboardingHeaderProps {
  currentStep: number
  totalSteps: number
  onBack?: () => void
}

export const OnboardingHeader = ({
  currentStep,
  totalSteps,
  onBack,
}: OnboardingHeaderProps) => {
  const { theme } = useTheme()

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-primary-foreground">
            <Image
              src={`/logo-${theme === "dark" ? "light" : "dark"}-no-bg.svg`}
              alt={`logo`}
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-lg font-semibold">Agropilot</span>
        </div>
      </div>

      <span className="text-sm text-muted-foreground">
        Paso {currentStep} de {totalSteps}
      </span>
    </header>
  )
}
