"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

/**
 * Parcelas reales (foto aérea de dron) convertidas a base monocroma con un
 * overlay animado de líneas que delimitan las parcelas, al estilo de un
 * sistema de análisis geoespacial (GIS / NDVI / satélite).
 *
 * - La imagen NO se anima: solo es el fondo en escala de grises.
 * - Las líneas se "dibujan" progresivamente en bucle infinito con efecto
 *   de escaneo, un leve glow y nodos pulsantes en las esquinas de parcela.
 */

type Polyline = number[][] // pares [x, y] normalizados 0..1

// Lindes de parcela trazados sobre la foto real (coordenadas 0..1).
// Siguen las divisiones diagonales y la hilera de árboles de la imagen.
const PARCEL_PATHS: Polyline[] = [
  [
    [0, 0.168],
    [0.159, 0.281],
    [0, 0.419],
  ],
  [
    [0.279, 0.341],
    [0.432, 0],
  ],
  [
    [0.507, 0.512],
    [0.571, 0],
  ],
  [
    [0.159, 0.281],
    [0.451, 0.479],
    [0.02, 0.866],
    [0.016, 0.993],
  ],
  [
    [0.451, 0.479],
    [0.79, 0.689],
    [0.843, 0],
  ],
  [
    [0.79, 0.689],
    [1, 0.686],
  ],
]
const NODES: number[][] = [
  [0.159, 0.281], // P1 ↔ P4
  [0.451, 0.479], // P4 ↔ P5
  [0.79, 0.689], // P5 ↔ P6
]

export function AerialParcels() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Color de tinta tomado del tema (monocromo).
    const stroke = getComputedStyle(canvas).color || "rgba(255,255,255,0.9)"

    // Longitud por segmento de cada polilínea para el efecto "draw".
    type Prepared = { pts: number[][]; segLen: number[]; total: number }
    const prepare = (line: Polyline): Prepared => {
      const segLen: number[] = []
      let total = 0
      for (let i = 1; i < line.length; i++) {
        const curr = line[i] as number[]
        const prev = line[i - 1] as number[]
        const dx = ((curr[0] as number) - (prev[0] as number)) * width
        const dy = ((curr[1] as number) - (prev[1] as number)) * height
        const l = Math.hypot(dx, dy)
        segLen.push(l)
        total += l
      }
      return { pts: line, segLen, total }
    }

    const DURATION = 4200 // ms para dibujar todo
    const HOLD = 1000 // ms completo antes de reiniciar
    const FADE = 700 // ms de desvanecido suave
    const CYCLE = DURATION + HOLD + FADE

    const strokePartial = (
      pts: number[][],
      segLen: number[],
      drawLen: number
    ) => {
      if (pts.length < 2) return
      ctx.beginPath()
      const first = pts[0] as number[]
      ctx.moveTo((first[0] as number) * width, (first[1] as number) * height)
      let acc = 0
      for (let i = 1; i < pts.length; i++) {
        const l = segLen[i - 1]!
        const curr = pts[i] as number[]
        const prev = pts[i - 1] as number[]
        if (acc + l <= drawLen) {
          ctx.lineTo((curr[0] as number) * width, (curr[1] as number) * height)
          acc += l
        } else {
          const remain = drawLen - acc
          const tt = l > 0 ? remain / l : 0
          const x = (prev[0] as number) + ((curr[0] as number) - (prev[0] as number)) * tt
          const y = (prev[1] as number) + ((curr[1] as number) - (prev[1] as number)) * tt
          ctx.lineTo(x * width, y * height)
          break
        }
      }
      ctx.stroke()
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height)
      const prepared = PARCEL_PATHS.map(prepare)
      const t = now % CYCLE

      const drawT = Math.min(1, t / DURATION)
      const eased = drawT < 1 ? 1 - Math.pow(1 - drawT, 3) : 1

      let alpha = 1
      if (t > DURATION + HOLD) alpha = 1 - (t - DURATION - HOLD) / FADE

      const pulse = 0.55 + 0.45 * Math.sin(now / 650)

      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      for (const { pts, segLen, total } of prepared) {
        const drawLen = total * eased

        // Glow tenue debajo
        ctx.save()
        ctx.globalAlpha = alpha * 0.25 * pulse
        ctx.strokeStyle = stroke
        ctx.lineWidth = 9
        ctx.shadowColor = stroke
        ctx.shadowBlur = 12
        strokePartial(pts, segLen, drawLen)
        ctx.restore()

        // Línea nítida encima
        ctx.save()
        ctx.globalAlpha = alpha * 0.92
        ctx.strokeStyle = stroke
        ctx.lineWidth = 2.5
        strokePartial(pts, segLen, drawLen)
        ctx.restore()
      }

      // Nodos pulsantes en las esquinas de parcela
      for (const node of NODES) {
        const [nx, ny] = node as [number, number]
        const x = nx * width
        const y = ny * height
        ctx.save()
        ctx.globalAlpha = alpha * (0.5 + 0.5 * pulse)
        ctx.fillStyle = stroke
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = alpha * 0.18 * pulse
        ctx.beginPath()
        ctx.arc(x, y, 7 + 4 * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Imagen base monocroma (no se anima) */}
      <Image
        src="/parcel-landing-2.webp"
        alt="Vista aérea de parcelas agrícolas en escala de grises"
        className="absolute inset-0 h-full w-full object-cover"
        width={1400}
        height={1400}
        priority
        quality={100}
        style={{ filter: "grayscale(1) contrast(1.08) brightness(0.92)" }}
        draggable={false}
      />
      {/* Velo para integrar la imagen con el tema y dar profundidad */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--background) 2%, transparent 45%), radial-gradient(120% 80% at 50% 0%, transparent 55%, var(--background) 100%)",
          opacity: 0.8,
        }}
      />
      {/* Overlay animado de líneas de parcela */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full text-foreground"
        aria-hidden="true"
      />
    </div>
  )
}
