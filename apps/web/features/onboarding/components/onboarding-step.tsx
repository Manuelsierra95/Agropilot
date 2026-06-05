"use client"

import type { ReactNode } from "react"

export type OnboardingStepContext = {
  stepIndex: number
  totalSteps: number
  onContinue: () => void
  onSkip?: () => void
}

export type OnboardingStepRenderer = (
  context: OnboardingStepContext
) => ReactNode

interface OnboardingStepProps {
  steps: OnboardingStepRenderer[]
  currentStep: number
  onContinue: () => void
  onSkip?: () => void
}

export function OnboardingStep({
  steps,
  currentStep,
  onContinue,
  onSkip,
}: OnboardingStepProps) {
  const render = steps[currentStep - 1]

  if (!render) {
    return null
  }

  return (
    <div className="h-full min-h-0 bg-sidebar text-sidebar-foreground">
      {render({
        stepIndex: currentStep,
        totalSteps: steps.length,
        onContinue,
        onSkip,
      })}
    </div>
  )
}
