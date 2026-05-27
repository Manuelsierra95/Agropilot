import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

interface GradientSeparatorProps {
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function GradientSeparator({
  orientation = "vertical",
  className,
}: GradientSeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      className={cn(
        orientation === "vertical"
          ? "h-auto self-stretch bg-gradient-to-b from-transparent via-border to-transparent"
          : "w-auto self-stretch bg-gradient-to-r from-transparent via-border to-transparent",
        className
      )}
    />
  )
}
