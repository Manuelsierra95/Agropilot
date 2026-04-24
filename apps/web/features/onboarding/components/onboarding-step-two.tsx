import { AnimatePresence, motion } from "motion/react"

import { ChipButton } from "./chip-button"
import { IrrigationCard } from "./irrigation-card"
import {
  cropTypes,
  irrigationSystems,
  irrigationTypes,
  soilTypes,
  transitionProps,
} from "./onboarding-data"

type OnboardingStepTwoProps = {
  selectedCrop: string
  selectedIrrigation: string
  selectedIrrigationSystem: string
  selectedSoilType: string
  parcelSize: string
  onSelectCrop: (value: string) => void
  onSelectIrrigation: (value: "secano" | "riego") => void
  onSelectIrrigationSystem: (value: string) => void
  onSelectSoilType: (value: string) => void
  onParcelSizeChange: (value: string) => void
}

export function OnboardingStepTwo({
  selectedCrop,
  selectedIrrigation,
  selectedIrrigationSystem,
  selectedSoilType,
  parcelSize,
  onSelectCrop,
  onSelectIrrigation,
  onSelectIrrigationSystem,
  onSelectSoilType,
  onParcelSizeChange,
}: OnboardingStepTwoProps) {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        Detalles del cultivo
      </h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Configura el tipo de cultivo y las características de la parcela.
      </p>

      <div className="mb-8">
        <label className="mb-4 block text-sm font-medium text-foreground">
          Tipo de cultivo
        </label>
        <motion.div
          className="flex flex-wrap gap-3 overflow-visible"
          layout
          transition={transitionProps}
        >
          {cropTypes.map((crop) => (
            <ChipButton
              key={crop}
              label={crop}
              isSelected={selectedCrop === crop}
              onClick={() => onSelectCrop(crop)}
            />
          ))}
        </motion.div>
      </div>

      <div className="mb-8">
        <label className="mb-4 block text-sm font-medium text-foreground">
          Tipo de riego
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {irrigationTypes.map((type) => (
            <IrrigationCard
              key={type.id}
              type={type}
              isSelected={selectedIrrigation === type.id}
              onClick={() => {
                onSelectIrrigation(type.id)
                if (type.id === "secano") {
                  onSelectIrrigationSystem("")
                }
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedIrrigation === "riego" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <label className="mb-4 block text-sm font-medium text-foreground">
              Sistema de riego
            </label>
            <motion.div
              className="flex flex-wrap gap-3 overflow-visible"
              layout
              transition={transitionProps}
            >
              {irrigationSystems.map((system) => (
                <ChipButton
                  key={system}
                  label={system}
                  isSelected={selectedIrrigationSystem === system}
                  onClick={() => onSelectIrrigationSystem(system)}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <label className="mb-4 block text-sm font-medium text-foreground">
          Tipo de suelo{" "}
          <span className="text-muted-foreground">(opcional)</span>
        </label>
        <motion.div
          className="flex flex-wrap gap-3 overflow-visible"
          layout
          transition={transitionProps}
        >
          {soilTypes.map((soil) => (
            <ChipButton
              key={soil}
              label={soil}
              isSelected={selectedSoilType === soil}
              onClick={() =>
                onSelectSoilType(selectedSoilType === soil ? "" : soil)
              }
            />
          ))}
        </motion.div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Superficie (hectáreas){" "}
          <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          type="number"
          value={parcelSize}
          onChange={(e) => onParcelSizeChange(e.target.value)}
          placeholder="Ej: 5.5"
          step="0.1"
          min="0"
          className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground/80 focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10 focus:outline-none"
        />
      </div>
    </div>
  )
}
