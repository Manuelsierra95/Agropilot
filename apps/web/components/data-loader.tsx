"use client"

import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * How to use the DataLoader component:
 *
 * ```tsx
 * <div className="py-6">
 *   <DataLoader
 *     size="lg"
 *     message="Cargando resumen del dashboard..."
 *     className="mx-auto"
 *   />
 * </div>
 * ```
 */

interface DataLoaderProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28",
}

const STROKE_WIDTH = 4.4
const PARTICLE_COUNT = 85
const TRAIL_SPAN = 0.34
const DURATION_MS = 4600
const ROTATION_DURATION_MS = 28000
const PULSE_DURATION_MS = 4200
const SPIRAL_R = 5
const SPIRAL_r = 1
const SPIRAL_D = 3
const SPIRAL_SCALE = 2.2
const SPIRAL_BREATH = 0.45

interface Particle {
  x: number
  y: number
  radius: number
  opacity: number
}

interface LoaderFrame {
  rotation: number
  pathD: string
  particles: Particle[]
}

function normalizeProgress(progress: number) {
  return ((progress % 1) + 1) % 1
}

function getDetailScale(time: number) {
  const pulseProgress = (time % PULSE_DURATION_MS) / PULSE_DURATION_MS
  const pulseAngle = pulseProgress * Math.PI * 2
  return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48
}

function getSpiralPoint(progress: number, detailScale: number) {
  const t = progress * Math.PI * 2
  const d = SPIRAL_D + detailScale * 0.25
  const ratio = (SPIRAL_R - SPIRAL_r) / SPIRAL_r

  const baseX = (SPIRAL_R - SPIRAL_r) * Math.cos(t) + d * Math.cos(ratio * t)
  const baseY = (SPIRAL_R - SPIRAL_r) * Math.sin(t) - d * Math.sin(ratio * t)

  const scale = SPIRAL_SCALE + detailScale * SPIRAL_BREATH

  return {
    x: 50 + baseX * scale,
    y: 50 + baseY * scale,
  }
}

function buildPath(detailScale: number, steps = 480) {
  const commands: string[] = []

  for (let index = 0; index <= steps; index += 1) {
    const point = getSpiralPoint(index / steps, detailScale)
    commands.push(
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
  }

  return commands.join(" ")
}

function getParticle(index: number, progress: number, detailScale: number) {
  const tailOffset = index / (PARTICLE_COUNT - 1)
  const point = getSpiralPoint(
    normalizeProgress(progress - tailOffset * TRAIL_SPAN),
    detailScale
  )
  const fade = Math.pow(1 - tailOffset, 0.56)

  return {
    x: point.x,
    y: point.y,
    radius: 0.9 + fade * 2.7,
    opacity: 0.04 + fade * 0.96,
  }
}

function buildFrame(time: number): LoaderFrame {
  const progress = (time % DURATION_MS) / DURATION_MS
  const detailScale = getDetailScale(time)
  const rotation = -((time % ROTATION_DURATION_MS) / ROTATION_DURATION_MS) * 360

  const particles: Particle[] = []
  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    particles.push(getParticle(index, progress, detailScale))
  }

  return {
    rotation,
    pathD: buildPath(detailScale),
    particles,
  }
}

export function DataLoader({
  message,
  size = "md",
  className,
}: DataLoaderProps) {
  const [frame, setFrame] = useState<LoaderFrame>(() => buildFrame(0))

  useEffect(() => {
    let animationFrameId = 0
    const startedAt = performance.now()

    const animate = (now: number) => {
      setFrame(buildFrame(now - startedAt))
      animationFrameId = window.requestAnimationFrame(animate)
    }

    animationFrameId = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className={cn("text-zinc-500/80 dark:text-primary", sizeClasses[size])}
      >
        <g transform={`rotate(${frame.rotation.toFixed(2)} 50 50)`}>
          <path
            d={frame.pathD}
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.14}
          />
          {frame.particles.map((particle, index) => (
            <circle
              key={index}
              cx={particle.x.toFixed(2)}
              cy={particle.y.toFixed(2)}
              r={particle.radius.toFixed(2)}
              opacity={particle.opacity.toFixed(3)}
              fill="currentColor"
            />
          ))}
        </g>
      </svg>
      {message && (
        <p className="animate-pulse text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}
