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
  /** Color of the ripple circles */
  color?: string
}

export function RippleBackground({
  className,
  children,
  company,
  logo,
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  color = "rgba(255, 255, 255, 0.8)",
}: RippleProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <style>{`
        @keyframes ripple-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
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
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                opacity,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
                border: `1.5px solid ${color}`,
                backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
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
          className="absolute top-1/2 left-1/2 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2.5 rounded-full bg-background/10 px-7 py-3 text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase"
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
