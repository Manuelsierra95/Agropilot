import { motion } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

import { type IrrigationType, transitionProps } from "./onboarding-data"

type IrrigationCardProps = {
  type: IrrigationType
  isSelected: boolean
  onClick: () => void
}

export function IrrigationCard({
  type,
  isSelected,
  onClick,
}: IrrigationCardProps) {
  const Icon = type.icon

  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      initial={false}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={transitionProps}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-sm transition-colors",
        isSelected
          ? "border-foreground/15 bg-foreground/5 text-foreground dark:bg-foreground/10"
          : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground"
      )}
    >
      <Icon className="mb-3 h-8 w-8" />
      <span className="text-lg font-medium">{type.label}</span>
      <span className="mt-1 text-sm text-muted-foreground">
        {type.description}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-3"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="h-3 w-3" strokeWidth={2} />
          </div>
        </motion.div>
      )}
    </motion.button>
  )
}
