"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin } from "lucide-react"

import { OnboardingFooter } from "./components/onboarding-footer"
import { OnboardingProgress } from "./components/onboarding-progress"
import { OnboardingStepOne } from "./components/onboarding-step-one"
import { OnboardingStepThree } from "./components/onboarding-step-three"
import { OnboardingStepTwo } from "./components/onboarding-step-two"

type Parcel = {
  id: string
  name: string
  crop: string
  irrigation: string
  irrigationSystem: string
  soilType: string
  size: string
}

export default function ParcelOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [parcelName, setParcelName] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("")
  const [selectedIrrigation, setSelectedIrrigation] = useState("")
  const [selectedIrrigationSystem, setSelectedIrrigationSystem] = useState("")
  const [selectedSoilType, setSelectedSoilType] = useState("")
  const [parcelSize, setParcelSize] = useState("")

  const totalSteps = 3
  const isStepOneComplete = parcelName.trim() !== ""
  const isStepTwoComplete =
    selectedCrop !== "" &&
    selectedIrrigation !== "" &&
    (selectedIrrigation !== "riego" || selectedIrrigationSystem !== "")
  const isStepThreeComplete = true
  const canProceed =
    currentStep === 1
      ? isStepOneComplete
      : currentStep === 2
        ? isStepTwoComplete
        : isStepThreeComplete

  const handleNext = () => {
    if (currentStep === 2) {
      // Save current parcel when moving to step 3
      const newParcel: Parcel = {
        id: `parcel-${Date.now()}`,
        name: parcelName,
        crop: selectedCrop,
        irrigation: selectedIrrigation,
        irrigationSystem: selectedIrrigationSystem,
        soilType: selectedSoilType,
        size: parcelSize,
      }
      setParcels((prev) => [...prev, newParcel])
    }
    setCurrentStep((step) => Math.min(step + 1, totalSteps))
  }

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 1))
  }

  const handleSubmit = () => {
    // TODO: Enviar al completar el step 2, un user.onboardingCompleted = true
    // Y aqui en el if comprobar que el usuario tiene onboardingCompleted = true, y si no es asi, mostrar un mensaje de error diciendo que debe completar el onboarding
    // if (!onboardingCompleted) {
    //   alert("Debes crear al menos una parcela")
    //   return
    // }
    console.log("Parcelas creadas:", parcels)
    alert("Parcelas creadas correctamente!")
    router.push("/dashboard")
  }

  const handleAddAnotherParcel = () => {
    setParcelName("")
    setSelectedCrop("")
    setSelectedIrrigation("")
    setSelectedIrrigationSystem("")
    setSelectedSoilType("")
    setParcelSize("")
    setCurrentStep(1)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-136 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.24),transparent_42%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%)]" />
        <div className="absolute inset-x-0 top-0 h-136 bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.08),transparent_42%),radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.06),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.09),transparent_42%),radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.07),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.16)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.16)_1px,transparent_1px)] bg-size-[72px_72px] opacity-30 dark:opacity-18" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-190">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur">
                <MapPin className="h-5 w-5 text-foreground/70 dark:text-foreground/80" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-[0.24em] text-foreground uppercase">
                  Agropilot
                </h2>
                <p className="text-xs text-muted-foreground">Alta de parcela</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_20px_80px_-32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
              >
                {currentStep === 1 && (
                  <OnboardingStepOne
                    parcelName={parcelName}
                    onParcelNameChange={setParcelName}
                  />
                )}

                {currentStep === 2 && (
                  <OnboardingStepTwo
                    selectedCrop={selectedCrop}
                    selectedIrrigation={selectedIrrigation}
                    selectedIrrigationSystem={selectedIrrigationSystem}
                    selectedSoilType={selectedSoilType}
                    parcelSize={parcelSize}
                    onSelectCrop={setSelectedCrop}
                    onSelectIrrigation={setSelectedIrrigation}
                    onSelectIrrigationSystem={setSelectedIrrigationSystem}
                    onSelectSoilType={setSelectedSoilType}
                    onParcelSizeChange={setParcelSize}
                  />
                )}

                {currentStep === 3 && (
                  <OnboardingStepThree
                    parcels={parcels}
                    onAddAnotherParcel={handleAddAnotherParcel}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <OnboardingFooter
              currentStep={currentStep}
              totalSteps={totalSteps}
              canProceed={canProceed}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
