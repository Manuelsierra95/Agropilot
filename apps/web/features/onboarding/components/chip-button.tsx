import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

import { transitionProps } from "./onboarding-data"

type ChipButtonProps = {
  label: string
  isSelected: boolean
  onClick: () => void
}

export function ChipButton({ label, isSelected, onClick }: ChipButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      initial={false}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={transitionProps}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ring-1 transition-colors ring-inset",
        isSelected
          ? "bg-foreground/5 text-foreground shadow-sm ring-foreground/10 dark:bg-foreground/10"
          : "bg-muted/70 text-muted-foreground ring-border/80 hover:bg-muted hover:text-foreground"
      )}
    >
      <motion.div
        className="relative flex items-center"
        animate={{
          paddingRight: isSelected ? "1.5rem" : "0",
        }}
        transition={{
          ease: [0.175, 0.885, 0.32, 1.275],
          duration: 0.3,
        }}
      >
        <span>{label}</span>
        <AnimatePresence>
          {isSelected && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={transitionProps}
              className="absolute right-0"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="h-3 w-3 text-white" strokeWidth={1.5} />
              </div>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  )
}
