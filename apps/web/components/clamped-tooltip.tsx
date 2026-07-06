"use client"

import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

type ClampedTooltipProps = {
  text: string
  className?: string
  lines?: 1 | 2
}

export function ClampedTooltip({
  text,
  className,
  lines = 2,
}: ClampedTooltipProps) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = React.useState(false)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (el) setIsClamped(el.scrollHeight > el.clientHeight)
  }, [text, lines])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p
          ref={ref}
          className={cn(
            "cursor-default text-xs leading-relaxed text-muted-foreground",
            lines === 1 ? "line-clamp-1" : "line-clamp-2",
            className
          )}
        >
          {text}
        </p>
      </TooltipTrigger>
      {isClamped && (
        <TooltipContent
          side="bottom"
          className="max-w-[260px] text-xs leading-relaxed"
        >
          {text}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
