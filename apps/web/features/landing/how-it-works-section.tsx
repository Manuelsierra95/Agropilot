"use client"

import { useEffect, useRef, useState } from "react"

const steps = [
  {
    number: "I",
    title: "Registra tus parcelas",
    description:
      "Añade tus olivares con ubicación, variedad y tipo de cultivo. En menos de 5 minutos tendrás toda tu finca en el sistema.",
  },
  {
    number: "II",
    title: "Obtén decisiones automáticas",
    description:
      "Agropilot analiza el clima, los riesgos y los precios del mercado para darte recomendaciones accionables.",
  },
  {
    number: "III",
    title: "Actúa con confianza",
    description:
      "Riega, trata o cosecha en el momento óptimo. Tu copilot te guía en cada decisión para maximizar el margen.",
  },
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const visualTitles = ["onboarding", "analytics", "copilot"]

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-foreground py-24 text-background lg:py-32"
    >
      {/* Diagonal lines pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-background/50">
            <span className="h-px w-8 bg-background/30" />
            Cómo funciona
          </span>
          <h2
            className={`font-display text-4xl tracking-tight transition-all duration-700 lg:text-6xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Tres pasos.
            <br />
            <span className="text-background/50">Olivar conectado.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`group w-full border-b border-background/10 py-8 text-left transition-all duration-500 ${
                  activeStep === index
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-background/30">
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display mb-3 text-2xl transition-transform duration-300 group-hover:translate-x-2 lg:text-3xl">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-background/60">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    {activeStep === index && (
                      <div className="mt-4 h-px overflow-hidden bg-background/20">
                        <div
                          className="h-full w-0 bg-background"
                          style={{
                            animation: "progress 5s linear forwards",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Dynamic visual display */}
          <div className="self-start lg:sticky lg:top-32">
            <div className="overflow-hidden border border-background/10">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-background/10 px-6 py-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-background/20" />
                  <div className="h-3 w-3 rounded-full bg-background/20" />
                  <div className="h-3 w-3 rounded-full bg-background/20" />
                </div>
                <span className="font-mono text-xs text-background/40">
                  {visualTitles[activeStep]}.tsx
                </span>
              </div>

              {/* Visual content */}
              <div className="h-[680px] overflow-hidden p-6">
                {activeStep === 0 && (
                  <ParcelOnboardingVisual key="onboarding" />
                )}
                {activeStep === 1 && <AgriculturalDataVisual key="analytics" />}
                {activeStep === 2 && <CopilotChatVisual key="copilot" />}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 border-t border-background/10 px-6 py-4">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="font-mono text-xs text-background/40">
                  En vivo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-draw-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawPath 1.5s ease-out forwards;
        }

        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }

        .animate-fill-area {
          opacity: 0;
          animation: fillArea 1s ease-out 0.8s forwards;
        }

        @keyframes fillArea {
          to {
            opacity: 1;
          }
        }

        .animate-pulse-dot {
          animation: pulseDot 1.4s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-typing-cursor::after {
          content: "|";
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-400 {
          animation-delay: 400ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-600 {
          animation-delay: 600ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-800 {
          animation-delay: 800ms;
        }
      `}</style>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 1: Parcel onboarding visual                                           */
/* -------------------------------------------------------------------------- */

const parcelDemo = {
  name: "Finca El Cerro",
  cropType: "Olivar",
  irrigationType: "Regadío",
  areaHa: "24.5 ha",
}

function ParcelOnboardingVisual() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 2600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header card */}
      <div className="mb-5 flex items-center gap-4 rounded-lg border border-background/10 bg-background/[0.03] p-4">
        <div className="font-display flex h-12 w-12 items-center justify-center rounded-xl bg-background/10 text-xl font-semibold text-background">
          {phase >= 1 ? parcelDemo.name.charAt(0) : ""}
        </div>
        <div className="flex-1">
          <div className="h-6 overflow-hidden">
            {phase >= 1 ? (
              <span className="animate-fade-in-up inline-block font-medium text-background">
                {parcelDemo.name}
              </span>
            ) : (
              <span className="animate-typing-cursor inline-block h-5 w-32 rounded bg-background/10" />
            )}
          </div>
          <p className="text-sm text-background/40">1 parcela · Vista previa</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {phase >= 2 && (
            <span className="animate-fade-in-up rounded-full border border-background/20 bg-background/5 px-2.5 py-0.5 text-xs text-background/80">
              {parcelDemo.cropType}
            </span>
          )}
          {phase >= 3 && (
            <span className="animate-fade-in-up rounded-full border border-background/20 px-2.5 py-0.5 text-xs text-background/60 delay-100">
              {parcelDemo.irrigationType}
            </span>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <AnimatedField
          label="Nombre de la parcela"
          value={phase >= 1 ? parcelDemo.name : ""}
          delay={0}
        />
        <AnimatedField
          label="Variedad"
          value={phase >= 2 ? "Picual" : ""}
          delay={1}
        />
        <AnimatedField
          label="Régimen hídrico"
          value={phase >= 3 ? parcelDemo.irrigationType : ""}
          delay={2}
        />
        {/* <AnimatedField
          label="Superficie"
          value={phase >= 4 ? parcelDemo.areaHa : ""}
          delay={3}
        /> */}
      </div>

      {/* Map preview */}
      {phase >= 5 && (
        <div className="animate-fade-in-up mt-5 rounded-lg border border-background/10 bg-background/[0.03] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-background/40">Ubicación</span>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Localizada
            </span>
          </div>
          <svg viewBox="0 0 280 120" className="w-full">
            <polygon
              points="60,85 110,30 170,45 230,25 250,70 190,100 130,95 80,105"
              fill="currentColor"
              className="animate-fill-area text-background/10"
            />
            <polygon
              points="60,85 110,30 170,45 230,25 250,70 190,100 130,95 80,105"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-draw-path text-background/40"
            />
            <circle
              cx="155"
              cy="62"
              r="4"
              className="animate-pulse-dot text-background"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

function AnimatedField({
  label,
  value,
  delay,
}: {
  label: string
  value: string
  delay: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-background/40">{label}</label>
      <div className="h-10 rounded-md border border-background/10 bg-background/[0.03] px-3 py-2">
        {value ? (
          <span
            className={`animate-fade-in-up delay-${delay * 100} text-sm text-background/80`}
          >
            {value}
          </span>
        ) : (
          <span className="inline-block h-4 w-full rounded bg-background/5" />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 2: Agricultural data visual                                           */
/* -------------------------------------------------------------------------- */

const priceData = [
  { month: "Ene", price: 6.8 },
  { month: "Feb", price: 6.9 },
  { month: "Mar", price: 7.1 },
  { month: "Abr", price: 7.3 },
  { month: "May", price: 7.2 },
  { month: "Jun", price: 7.5 },
  { month: "Jul", price: 7.8 },
  { month: "Ago", price: 7.9 },
  { month: "Sep", price: 8.1 },
  { month: "Oct", price: 8.0 },
  { month: "Nov", price: 8.2 },
  { month: "Dic", price: 8.4 },
]

const weatherMetricsDemo = [
  { label: "Temperatura", value: "28°C", icon: "temp", change: "+2°C" },
  { label: "Lluvia 7 días", value: "12 mm", icon: "rain", change: "-8 mm" },
  { label: "Humedad", value: "45%", icon: "humidity", change: " estable" },
]

const riskAlertsDemo = [
  {
    type: "water",
    level: "medium",
    message: "Estrés hídrico detectado en Finca El Cerro",
  },
  { type: "fungal", level: "low", message: "Riesgo fúngico bajo esta semana" },
]

function AgriculturalDataVisual() {
  const [visiblePoints, setVisiblePoints] = useState(0)
  const [showMetrics, setShowMetrics] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisiblePoints(4), 300),
      setTimeout(() => setVisiblePoints(8), 700),
      setTimeout(() => setVisiblePoints(12), 1100),
      setTimeout(() => setShowMetrics(true), 1400),
      setTimeout(() => setShowAlerts(true), 1900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const maxPrice = Math.max(...priceData.map((d) => d.price))
  const minPrice = Math.min(...priceData.map((d) => d.price))
  const range = maxPrice - minPrice || 1

  const points = priceData
    .slice(0, visiblePoints)
    .map((d, i) => {
      const x = (i / (priceData.length - 1)) * 260 + 10
      const y = 110 - ((d.price - minPrice) / range) * 80
      return `${x},${y}`
    })
    .join(" ")

  const areaPath =
    points &&
    `M ${points.split(" ")[0]?.split(",")[0]},110 ${points.replace(/,/g, " ")} L ${points.split(" ").pop()?.split(",")[0]},110 Z`

  const linePath = points && `M ${points.replace(/,/g, " ")}`

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Price chart */}
      <div className="rounded-lg border border-background/10 bg-background/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-background">
              Precio del aceite
            </p>
            <p className="text-xs text-background/40">Virgen extra · €/kg</p>
          </div>
          {visiblePoints === priceData.length && (
            <span className="animate-fade-in-up flex items-center gap-1 text-xs text-green-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 8L6 4L10 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              +23% este año
            </span>
          )}
        </div>

        <svg viewBox="0 0 280 130" className="w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="10"
              y1={30 + i * 25}
              x2="270"
              y2={30 + i * 25}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-background/5"
            />
          ))}

          {/* Area */}
          {areaPath && (
            <path
              d={areaPath}
              fill="currentColor"
              className="animate-fill-area text-background/10"
            />
          )}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-path text-background/70"
            />
          )}

          {/* Data points */}
          {priceData.slice(0, visiblePoints).map((d, i) => {
            const x = (i / (priceData.length - 1)) * 260 + 10
            const y = 110 - ((d.price - minPrice) / range) * 80
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                className="animate-fade-in-up text-background"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            )
          })}
        </svg>
      </div>

      {/* Weather metrics */}
      {showMetrics && (
        <div className="animate-fade-in-up grid grid-cols-3 gap-3">
          {weatherMetricsDemo.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-background/10 bg-background/[0.03] p-3"
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/10">
                <WeatherIcon type={metric.icon} />
              </div>
              <p className="font-display text-lg text-background">
                {metric.value}
              </p>
              <p className="text-[10px] text-background/40">{metric.label}</p>
              <p className="mt-1 text-[10px] text-background/50">
                {metric.change}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {showAlerts && (
        <div className="animate-fade-in-up space-y-2 delay-200">
          {riskAlertsDemo.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-background/10 bg-background/[0.03] p-3"
            >
              <span
                className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  alert.level === "medium" ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <div>
                <p className="text-sm text-background/80">{alert.message}</p>
                <p className="text-[10px] tracking-wider text-background/40 uppercase">
                  {alert.type === "water" ? "Riesgo hídrico" : "Riesgo fúngico"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WeatherIcon({ type }: { type: string }) {
  const iconClass = "h-3.5 w-3.5 text-background/60"
  switch (type) {
    case "temp":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="9" r="4" />
          <path d="M12 13v8" />
          <path d="M12 17h-3" />
          <path d="M12 20h-2" />
          <path d="M12 14h2" />
        </svg>
      )
    case "rain":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
          <path d="M16 14v6" />
          <path d="M8 14v6" />
          <path d="M12 16v6" />
        </svg>
      )
    case "humidity":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      )
    default:
      return null
  }
}

/* -------------------------------------------------------------------------- */
/* Step 3: Copilot chat visual                                                */
/* -------------------------------------------------------------------------- */

const chatMessages = [
  {
    role: "user" as const,
    content: "¿Debo regar la parcela norte?",
  },
  {
    role: "assistant" as const,
    content:
      "Sí, programa el riego para esta tarde. La parcela norte tiene estrés hídrico medio y la temperatura bajará a 22 °C esta noche, lo que optimizará la absorción.",
    action: { label: "Programar riego", type: "irrigation" },
  },
]

function CopilotChatVisual() {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [showAction, setShowAction] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleMessages(1), 400),
      setTimeout(() => setShowTyping(true), 900),
      setTimeout(() => {
        setShowTyping(false)
        setVisibleMessages(2)
      }, 1900),
      setTimeout(() => setShowAction(true), 2400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-background/10 bg-background/[0.03] p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10">
          <svg
            className="h-4 w-4 text-background/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-background">
            Agropilot Copilot
          </p>
          <p className="text-[10px] text-background/40">Asistente agrícola</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4">
        {chatMessages.map((message, index) =>
          index < visibleMessages ? (
            <div
              key={index}
              className={`animate-fade-in-up flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "rounded-br-sm bg-background text-foreground"
                    : "rounded-bl-sm border border-background/10 bg-background/[0.03] text-background/90"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ) : null
        )}

        {showTyping && (
          <div className="animate-fade-in-up flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-background/10 bg-background/[0.03] px-4 py-3">
              <div className="flex gap-1.5">
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-background/40"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-background/40"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-background/40"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {showAction && (
          <div className="animate-fade-in-up flex justify-start pl-2">
            <button
              type="button"
              className="group flex items-center gap-2 rounded-full border border-background/20 bg-background/5 px-4 py-2 text-sm text-background transition-all hover:bg-background/10"
            >
              <svg
                className="h-4 w-4 text-background/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              Programar riego
              <svg
                className="h-3.5 w-3.5 text-background/40 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Input placeholder */}
      <div className="mt-4 flex items-center gap-3 rounded-full border border-background/10 bg-background/[0.03] px-4 py-2.5">
        <span className="flex-1 text-sm text-background/30">
          Pregunta a Agropilot...
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/10">
          <svg
            className="h-3.5 w-3.5 text-background/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4 20-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
