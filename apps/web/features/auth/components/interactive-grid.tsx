"use client"

import { cn } from "@workspace/ui/lib/utils"
import React, { useState } from "react"

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param width - The width of each square.
 * @param height - The height of each square.
 * @param squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param className - The class name of the grid.
 * @param squaresClassName - The class name of the squares.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  squares?: [number, number] // [horizontal, vertical]
  className?: string
  squaresClassName?: string
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null)
  const svgWidth = width * horizontal
  const svgHeight = height * vertical

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      onMouseLeave={() => setHoveredSquare(null)}
      {...props}
    >
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        className="fill-transparent"
      />

      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width
        const y = Math.floor(index / horizontal) * height
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            strokeWidth={1.1}
            className={cn(
              "transition-all duration-150 ease-out [vector-effect:non-scaling-stroke] not-[&:hover]:duration-700",
              hoveredSquare === index
                ? "fill-neutral-200/50 dark:fill-neutral-700/40"
                : "fill-transparent",
              squaresClassName
            )}
            stroke="currentColor"
            style={{ stroke: "rgba(160, 160, 160, 0.4)" }}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        )
      })}
    </svg>
  )
}
