import React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Card } from "@workspace/ui/components/card"

interface StripesGridSeparatorProps {
  className?: string
  cardClassName?: string
  position?: "left" | "right" | "top" | "bottom" | "full"
  width?: string
  height?: string
  opacity?: string
}

export const StripesGridSeparator: React.FC<StripesGridSeparatorProps> = ({
  className,
  cardClassName,
  position = "right",
  width = "w-full",
  height = "h-full",
  opacity = "opacity-30",
}) => {
  const positionStyles = {
    right: "absolute top-0 right-0",
    left: "absolute top-0 left-0",
    top: "absolute top-0 left-0 w-full h-32",
    bottom: "absolute bottom-0 left-0 w-full h-32",
    full: "absolute inset-0",
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-background !p-0",
        cardClassName
      )}
      size="sm"
    >
      <div className="absolute inset-0">
        <div
          className={cn(
            "pointer-events-none z-10",
            "bg-[repeating-linear-gradient(45deg,_#00000066_0px,_#00000066_1px,_transparent_1px,_transparent_6px)]",
            "dark:bg-[repeating-linear-gradient(45deg,_#ffffff66_0px,_#ffffff66_1px,_transparent_1px,_transparent_6px)]",
            positionStyles[position],
            width,
            height,
            opacity,
            className
          )}
        />
      </div>
    </Card>
  )
}
