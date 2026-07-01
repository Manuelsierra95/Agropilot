"use client"

import { useEffect, useState, useRef } from "react"

const locations = [
  {
    city: "Jaén",
    region: "Campiña de Jaén",
    weather: {
      temp: 27.9,
      risks: {
        pest: "high",
        frost: "low",
        drought: "low",
        fungalRisk: "low",
        insectRisk: "high",
        waterStress: "medium",
        thermalStress: "low",
      },
    },
  },
  {
    city: "Córdoba",
    region: "Subbética",
    weather: {
      temp: 31.2,
      risks: {
        pest: "medium",
        frost: "low",
        drought: "high",
        fungalRisk: "low",
        insectRisk: "medium",
        waterStress: "high",
        thermalStress: "high",
      },
    },
  },
  {
    city: "Sevilla",
    region: "Sierra Morena",
    weather: {
      temp: 34.5,
      risks: {
        pest: "low",
        frost: "low",
        drought: "high",
        fungalRisk: "low",
        insectRisk: "low",
        waterStress: "high",
        thermalStress: "high",
      },
    },
  },
  {
    city: "Toledo",
    region: "Montes de Toledo",
    weather: {
      temp: 24.1,
      risks: {
        pest: "medium",
        frost: "low",
        drought: "low",
        fungalRisk: "medium",
        insectRisk: "medium",
        waterStress: "low",
        thermalStress: "low",
      },
    },
  },
  {
    city: "Ciudad Real",
    region: "Campo de Calatrava",
    weather: {
      temp: 22.3,
      risks: {
        pest: "low",
        frost: "low",
        drought: "low",
        fungalRisk: "low",
        insectRisk: "low",
        waterStress: "low",
        thermalStress: "low",
      },
    },
  },
]

const riskNames: Record<string, string> = {
  insectRisk: "Plaga (insecto)",
  pest: "Plaga",
  waterStress: "Estrés hídrico",
  fungalRisk: "Hongos",
  thermalStress: "Estrés térmico",
  frost: "Helada",
  drought: "Sequía",
}

const riskPriority = [
  "insectRisk",
  "pest",
  "waterStress",
  "fungalRisk",
  "thermalStress",
  "frost",
  "drought",
]

type RiskLevel = "high" | "medium" | "low"

function getCriticalRisk(risks: Record<string, string>) {
  const levelPriority: Record<RiskLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
  }
  let criticalKey = ""
  let criticalLevel: RiskLevel = "low"

  for (const key of riskPriority) {
    const level = risks[key] as RiskLevel
    if (levelPriority[level] > levelPriority[criticalLevel]) {
      criticalKey = key
      criticalLevel = level
    }
  }

  return { key: criticalKey, level: criticalLevel }
}

export function DataSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeLocation, setActiveLocation] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

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
      setActiveLocation((prev) => (prev + 1) % locations.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0"
            }`}
          >
            <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />
              Cobertura
            </span>
            <h2 className="font-display mb-8 text-4xl tracking-tight lg:text-6xl">
              Datos actualizados
              <br />
              en tiempo real.
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-muted-foreground">
              Datos meteorológicos de alta resolución para todo el olivar
              español. De Jaén a Córdoba, de Sevilla a Toledo.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="font-display mb-2 text-4xl lg:text-5xl">
                  100+
                </div>
                <div className="text-sm text-muted-foreground">
                  Estaciones meteo
                </div>
              </div>
              <div>
                <div className="font-display mb-2 text-4xl lg:text-5xl">
                  99.9%
                </div>
                <div className="text-sm text-muted-foreground">
                  Disponibilidad
                </div>
              </div>
              <div>
                <div className="font-display mb-2 text-4xl lg:text-5xl">
                  &lt;5km
                </div>
                <div className="text-sm text-muted-foreground">
                  Resolución datos
                </div>
              </div>
            </div>
          </div>

          {/* Right: Location list */}
          <div
            className={`transition-all delay-200 duration-700 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <span className="font-mono text-sm text-muted-foreground">
                  Red de monitorización
                </span>
                <span className="flex items-center gap-2 font-mono text-xs text-green-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Todo operativo
                </span>
              </div>

              {/* Locations */}
              <div>
                {locations.map((location, index) => (
                  <div
                    key={location.city}
                    className={`flex items-center justify-between border-b border-foreground/5 px-6 py-5 transition-all duration-300 last:border-b-0 ${
                      activeLocation === index ? "bg-foreground/[0.02]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                          activeLocation === index
                            ? "bg-foreground"
                            : "bg-foreground/20"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.region}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-foreground">
                        {location.weather.temp}°C
                      </span>
                      {(() => {
                        const critical = getCriticalRisk(location.weather.risks)
                        if (critical.level === "low") {
                          return (
                            <span className="text-muted-foreground">
                              Sin alertas
                            </span>
                          )
                        }
                        const color =
                          critical.level === "high"
                            ? "text-red-600"
                            : "text-amber-600"
                        const dotColor =
                          critical.level === "high"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        return (
                          <span
                            className={`flex items-center gap-1.5 ${color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
                            />
                            {riskNames[critical.key]}:{" "}
                            {critical.level === "high" ? "Alta" : "Media"}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
