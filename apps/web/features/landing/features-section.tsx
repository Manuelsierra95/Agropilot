"use client"

import { useEffect, useRef, useState } from "react"

const features = [
  {
    number: "01",
    title: "Monitorización inteligente",
    description:
      "Datos meteorológicos, estado del cultivo y riesgos en tiempo real para cada una de tus parcelas de olivar.",
    visual: "monitor",
  },
  {
    number: "02",
    title: "Copilot agrícola",
    description:
      "Pregunta lo que necesites en lenguaje natural. Tu asistente IA conoce cada rincón de tu finca y te guía en cada decisión.",
    visual: "ai",
  },
  {
    number: "03",
    title: "Gestión financiera completa",
    description:
      "Controla ingresos, gastos y márgenes por parcela y campaña. Sabe exactamente cuánto ganas con tu aceite.",
    visual: "finance",
  },
  {
    number: "04",
    title: "Alertas tempranas",
    description:
      "Anticipa riesgos fúngicos, hídricos y térmicos antes de que afecten a tu cosecha de olivas.",
    visual: "security",
  },
]

function DeployVisual() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full">
      <defs>
        <clipPath id="deployClip">
          <rect x="30" y="20" width="140" height="120" rx="4" />
        </clipPath>
      </defs>

      {/* Container */}
      <rect
        x="30"
        y="20"
        width="140"
        height="120"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Animated bars */}
      <g clipPath="url(#deployClip)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="40"
            y={35 + i * 16}
            width="120"
            height="10"
            rx="2"
            fill="currentColor"
            opacity="0.15"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.8;0.15"
              dur="2s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="width"
              values="20;120;20"
              dur="2s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </g>

      {/* Progress indicator */}
      <circle cx="100" cy="155" r="3" fill="currentColor" opacity="0.3">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}

function AIVisual() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full">
      {/* Central node */}
      <circle cx="100" cy="80" r="12" fill="currentColor">
        <animate
          attributeName="r"
          values="12;14;12"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Orbiting nodes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = i * 60 * (Math.PI / 180)
        const radius = 50
        return (
          <g key={i}>
            {/* Connection line */}
            <line
              x1="100"
              y1="80"
              x2={100 + Math.cos(angle) * radius}
              y2={80 + Math.sin(angle) * radius}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </line>

            {/* Outer node */}
            <circle
              cx={100 + Math.cos(angle) * radius}
              cy={80 + Math.sin(angle) * radius}
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="6;8;6"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )
      })}

      {/* Pulse rings */}
      <circle
        cx="100"
        cy="80"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0"
      >
        <animate
          attributeName="r"
          values="20;60"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}

function CollabVisual() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full">
      {/* User A */}
      <g>
        <rect
          x="30"
          y="50"
          width="50"
          height="60"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="55"
          y="85"
          textAnchor="middle"
          fontSize="20"
          fontFamily="monospace"
          fill="currentColor"
        >
          A
        </text>
        <circle
          cx="55"
          cy="35"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>

      {/* User B */}
      <g>
        <rect
          x="120"
          y="50"
          width="50"
          height="60"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="145"
          y="85"
          textAnchor="middle"
          fontSize="20"
          fontFamily="monospace"
          fill="currentColor"
        >
          B
        </text>
        <circle
          cx="145"
          cy="35"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>

      {/* Connection */}
      <line
        x1="80"
        y1="80"
        x2="120"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-8"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </line>

      {/* Data packet */}
      <circle r="4" fill="currentColor">
        <animateMotion dur="1.5s" repeatCount="indefinite">
          <mpath href="#dataPath" />
        </animateMotion>
      </circle>
      <path id="dataPath" d="M 80 80 L 120 80" fill="none" />

      {/* Sync indicator */}
      <g transform="translate(100, 130)">
        <circle r="6" fill="none" stroke="currentColor" strokeWidth="2">
          <animate
            attributeName="r"
            values="6;10;6"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  )
}

function SecurityVisual() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full">
      {/* Shield */}
      <path
        d="M 100 20 L 150 40 L 150 90 Q 150 130 100 145 Q 50 130 50 90 L 50 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Inner shield */}
      <path
        d="M 100 35 L 135 50 L 135 85 Q 135 115 100 128 Q 65 115 65 85 L 65 50 Z"
        fill="currentColor"
        opacity="0.1"
      >
        <animate
          attributeName="opacity"
          values="0.1;0.2;0.1"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Lock icon */}
      <rect x="85" y="70" width="30" height="25" rx="3" fill="currentColor" />
      <path
        d="M 90 70 L 90 60 Q 90 50 100 50 Q 110 50 110 60 L 110 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Keyhole */}
      <circle cx="100" cy="80" r="4" fill="white" />
      <rect x="98" y="82" width="4" height="8" fill="white" />

      {/* Scan lines */}
      <line
        x1="60"
        y1="60"
        x2="140"
        y2="60"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0"
      >
        <animate
          attributeName="y1"
          values="40;120;40"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="40;120;40"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;0.5;0"
          dur="3s"
          repeatCount="indefinite"
        />
      </line>
    </svg>
  )
}

function AnimatedVisual({ type }: { type: string }) {
  switch (type) {
    case "monitor":
      return <DeployVisual />
    case "ai":
      return <AIVisual />
    case "finance":
      return <CollabVisual />
    case "security":
      return <SecurityVisual />
    default:
      return <DeployVisual />
  }
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col gap-8 border-b border-foreground/10 py-12 lg:flex-row lg:gap-16 lg:py-20">
        {/* Number */}
        <div className="shrink-0">
          <span className="font-mono text-sm text-muted-foreground">
            {feature.number}
          </span>
        </div>

        {/* Content */}
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-display mb-4 text-3xl transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
              {feature.title}
            </h3>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>

          {/* Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="h-40 w-48 text-foreground">
              <AnimatedVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeaturesSection() {
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

  return (
    <section id="features" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <span className="h-px w-8 bg-foreground/30" />
            Funcionalidades
          </span>
          <h2
            className={`font-display text-4xl tracking-tight transition-all duration-700 lg:text-6xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Todo lo que necesitas.
            <br />
            <span className="text-muted-foreground">Nada que sobre.</span>
          </h2>
        </div>

        {/* Features List */}
        <div>
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
