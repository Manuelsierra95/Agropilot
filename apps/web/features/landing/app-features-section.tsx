"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Leaf,
} from "lucide-react"

const features = [
  {
    title: "Estado en tiempo real",
    description:
      "Clima, suelo y fenología de cada parcela actualizados cada hora.",
  },
  {
    title: "Alertas de riesgo",
    description:
      "Estrés hídrico, riesgo fúngico, plagas y heladas antes de que ocurran.",
  },
  {
    title: "Recomendaciones IA",
    description:
      "Consejos de riego, tratamiento y cosecha según el estado de tu olivar.",
  },
  {
    title: "Resumen de campaña",
    description: "Ingresos, gastos y margen por parcela. Sabe cuándo vender.",
  },
]

const displayViews = [
  { id: "parcela", label: "Estado de parcela" },
  { id: "riesgos", label: "Riesgos activos" },
  { id: "recomendacion", label: "Recomendación IA" },
  { id: "campana", label: "Resumen de campaña" },
] as const

const dashboardStyles = `
  @keyframes fieldBarFill {
    from { width: 0%; }
  }

  @keyframes fieldPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .field-bar {
    animation: fieldBarFill 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .field-pulse {
    animation: fieldPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const transition = {
  duration: 0.45,
  ease,
}

const viewVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
  }),
}

export function AppFeaturesSection() {
  const [activeView, setActiveView] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const changeView = (index: number) => {
    if (index === activeView) return
    setDirection(index > activeView ? 1 : -1)
    setActiveView(index)
  }

  useEffect(() => {
    if (isPaused || !isVisible) return
    const interval = setInterval(() => {
      setDirection(1)
      setActiveView((prev) => (prev + 1) % displayViews.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [isPaused, isVisible, activeView])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const currentView = displayViews[activeView] ?? displayViews[0]

  return (
    <section
      id="agricultores"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-foreground/10 bg-foreground/[0.02] py-24 lg:py-32"
    >
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />
              Para agricultores
            </span>
            <h2 className="font-display mb-8 text-4xl tracking-tight lg:text-6xl">
              Hecho para el campo.
              <br />
              <span className="text-muted-foreground">
                Automatizado con IA.
              </span>
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-muted-foreground">
              Agropilot monitoriza tus parcelas, anticipa riesgos y te dice qué
              hacer. Datos de campo, clima y mercado en un solo lugar — para que
              decidas con confianza.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`transition-all duration-500 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  <h3 className="mb-1 font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dynamic visual display */}
          <div
            className={`transition-all delay-200 duration-700 lg:sticky lg:top-32 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="border border-foreground/10 bg-background/50 backdrop-blur-sm"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Panel de Agropilot mostrando: ${currentView.label}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="field-pulse h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                    {currentView.label}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  Agropilot
                </span>
              </div>

              {/* Display content */}
              <div className="relative min-h-[320px] overflow-hidden p-5">
                <AnimatePresence
                  mode="popLayout"
                  custom={direction}
                  initial={false}
                >
                  <motion.div
                    key={activeView}
                    custom={direction}
                    variants={viewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    className="w-full"
                  >
                    {activeView === 0 && <ParcelaView />}
                    {activeView === 1 && <RiesgosView />}
                    {activeView === 2 && <RecomendacionView />}
                    {activeView === 3 && <CampanaView />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {displayViews.map((view, idx) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => changeView(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeView === idx
                      ? "w-8 bg-foreground"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                  aria-label={`Ver ${view.label}`}
                  aria-current={activeView === idx ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const childVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: delay * 0.001,
      ease,
    },
  }),
}

function AnimatedChild({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      custom={delay}
      variants={childVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ParcelaView() {
  return (
    <div className="space-y-5">
      <AnimatedChild>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Finca El Cerro</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Olivar · Regadío · Jaén
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            142 ha
          </span>
        </div>
      </AnimatedChild>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperatura"
          value="34°C"
          delay={80}
        />
        <MetricCard
          icon={<Droplets className="h-4 w-4" />}
          label="Humedad"
          value="23%"
          delay={160}
        />
        <MetricCard
          icon={<CloudRain className="h-4 w-4" />}
          label="Lluvia 24h"
          value="0 mm"
          delay={240}
        />
        <MetricCard
          icon={<Wind className="h-4 w-4" />}
          label="Viento"
          value="12 km/h"
          delay={320}
        />
      </div>

      <div className="space-y-3 border-t border-foreground/10 pt-4">
        <AnimatedChild delay={400}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-4 w-4" />
              <span>Fase fenológica</span>
            </div>
            <span className="text-sm font-medium">Cuajado</span>
          </div>
        </AnimatedChild>
        <AnimatedChild delay={480}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              GDD acumulados
            </span>
            <span className="text-sm font-medium">1.847</span>
          </div>
        </AnimatedChild>
        <AnimatedChild delay={560}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Kc / ETo</span>
            <span className="text-sm font-medium">0.65 / 6.2 mm</span>
          </div>
        </AnimatedChild>
      </div>
    </div>
  )
}

function RiesgosView() {
  const risks = [
    { label: "Estrés hídrico", value: 75, color: "bg-red-500" },
    { label: "Riesgo fúngico", value: 25, color: "bg-emerald-500" },
    { label: "Plagas (mosca)", value: 62, color: "bg-amber-500" },
    { label: "Estrés térmico", value: 50, color: "bg-amber-500" },
  ]

  return (
    <div className="space-y-5">
      <AnimatedChild>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Riesgos activos</span>
          <span className="font-mono text-xs text-muted-foreground">HOY</span>
        </div>
      </AnimatedChild>

      <div className="space-y-4">
        {risks.map((risk, index) => (
          <AnimatedChild key={risk.label} delay={index * 80 + 80}>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {risk.label}
                </span>
                <span className="text-sm font-medium">{risk.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/5">
                <div
                  className={`field-bar h-full rounded-full ${risk.color}`}
                  style={{
                    width: `${risk.value}%`,
                    animationDelay: `${index * 80 + 160}ms`,
                  }}
                />
              </div>
            </div>
          </AnimatedChild>
        ))}
      </div>

      <AnimatedChild delay={480}>
        <div className="border-t border-foreground/10 pt-4">
          <div className="flex items-center gap-3 rounded-sm border border-red-500/10 bg-red-500/5 p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium">2 alertas requieren acción</p>
              <p className="text-xs text-muted-foreground">
                Revisa el estrés hídrico y riesgo de plagas
              </p>
            </div>
          </div>
        </div>
      </AnimatedChild>
    </div>
  )
}

function RecomendacionView() {
  return (
    <div className="space-y-5">
      <AnimatedChild>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Recomendación Agropilot
          </span>
        </div>
      </AnimatedChild>

      <AnimatedChild delay={80}>
        <div className="border-l-2 border-red-500 py-1 pl-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wider text-red-500 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Urgente
          </span>
          <h4 className="mt-2 text-lg font-medium">Riego de emergencia</h4>
        </div>
      </AnimatedChild>

      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <AnimatedChild delay={160}>
          <p>
            El déficit hídrico a 30 días ha alcanzado nivel crítico en Finca El
            Cerro.
          </p>
        </AnimatedChild>
        <AnimatedChild delay={240}>
          <p>
            Tu olivar está en fase de cuajado: el estrés hídrico ahora repercute
            directamente en el volumen final de cosecha.
          </p>
        </AnimatedChild>
        <AnimatedChild delay={320}>
          <p>
            <span className="font-medium text-foreground">
              Acción recomendada:
            </span>{" "}
            programa un riego de recuperación en las próximas 24-48 horas.
          </p>
        </AnimatedChild>
      </div>

      <AnimatedChild delay={400}>
        <div className="space-y-2 border-t border-foreground/10 pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Crear tarea de riego
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 border border-foreground/10 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Ver balance hídrico
          </button>
        </div>
      </AnimatedChild>
    </div>
  )
}

function CampanaView() {
  return (
    <div className="space-y-5">
      <AnimatedChild>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Campaña 2025/2026</span>
          <span className="font-mono text-xs text-muted-foreground">
            Finca El Cerro
          </span>
        </div>
      </AnimatedChild>

      <div className="space-y-4">
        <AnimatedChild delay={80}>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ingresos</span>
              <span className="text-sm font-medium">€48.2K</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/5">
              <div
                className="field-bar h-full rounded-full bg-emerald-500"
                style={{ width: "80%", animationDelay: "120ms" }}
              />
            </div>
          </div>
        </AnimatedChild>

        <AnimatedChild delay={160}>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gastos</span>
              <span className="text-sm font-medium">€21.7K</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/5">
              <div
                className="field-bar h-full rounded-full bg-red-500"
                style={{ width: "45%", animationDelay: "200ms" }}
              />
            </div>
          </div>
        </AnimatedChild>
      </div>

      <AnimatedChild delay={240}>
        <div className="border-t border-foreground/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Margen estimado
            </span>
            <div className="text-right">
              <span className="text-lg font-medium">€26.5K</span>
              <span className="ml-2 font-mono text-xs text-emerald-500">
                +12%
              </span>
            </div>
          </div>
        </div>
      </AnimatedChild>

      <div className="space-y-3 border-t border-foreground/10 pt-4">
        <AnimatedChild delay={320}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Precio lonja</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-sm font-medium">€4.85/kg</span>
            </div>
          </div>
        </AnimatedChild>
        <AnimatedChild delay={400}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Ventana de venta
            </span>
            <span className="rounded-sm bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-600">
              FAVORABLE
            </span>
          </div>
        </AnimatedChild>
        <AnimatedChild delay={480}>
          <div className="flex items-start gap-2 rounded-sm border border-foreground/10 bg-foreground/[0.02] p-3">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground" />
            <p className="text-sm text-muted-foreground italic">
              "Buen momento para vender. El precio de lonja supera tu coste por
              kg en un 18%."
            </p>
          </div>
        </AnimatedChild>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  delay: number
}

function MetricCard({ icon, label, value, delay }: MetricCardProps) {
  return (
    <AnimatedChild delay={delay}>
      <div className="border border-foreground/10 bg-foreground/[0.01] p-3">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <span className="font-display text-xl tracking-tight">{value}</span>
      </div>
    </AnimatedChild>
  )
}
