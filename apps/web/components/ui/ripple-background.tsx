"use client"

import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

export interface RippleProps {
  className?: string
  children?: React.ReactNode
  company?: string
  logo?: React.ReactNode
  /** Size of the innermost circle in pixels */
  mainCircleSize?: number
  /** Opacity of the innermost circle */
  mainCircleOpacity?: number
  /** Number of concentric circles */
  numCircles?: number
  /** Color of the ripple circles in light mode */
  color?: string
  /** Color of the ripple circles in dark mode */
  darkColor?: string
}

export function RippleBackground({
  className,
  children,
  company,
  logo,
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  color = "rgba(0, 0, 0, 0.6)",
  darkColor = "hsl(var(--muted-foreground) / 0.2)",
}: RippleProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <style>{`
        @keyframes ripple-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -50%) scale(0.9); }
        }
        :root { --ripple-color: ${color}; }
        .dark { --ripple-color: ${darkColor}; }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, white 0%, white 58%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, white 0%, white 58%, transparent 100%)",
        }}
      >
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * 70
          const opacity = mainCircleOpacity - i * 0.03

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: size,
                height: size,
                opacity,
                transform: "translate(-50%, -50%) scale(1)",
                border: "1.5px solid var(--ripple-color)",
                backgroundColor:
                  "color-mix(in oklab, var(--ripple-color) 12%, transparent)",
                boxShadow:
                  "0 0 24px color-mix(in oklab, var(--foreground) 22%, transparent)",
                animation: "ripple-pulse 2s ease-in-out infinite",
                animationDelay: `${i * 0.06}s`,
              }}
            />
          )
        })}
      </div>

      {company && (
        <Link
          href="/"
          aria-label={company}
          className="absolute top-1/2 left-1/2 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2.5 rounded-full px-7 py-3 text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase transition-colors duration-300"
        >
          {logo}
          {company}
        </Link>
      )}

      {children && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  )
}
