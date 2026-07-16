"use client"

import { useEffect, useState } from "react"

const testimonials = [
  {
    quote:
      "Dejamos de regar a ciegas. Agropilot nos dice exactamente cuándo y cuánto regar en cada parcela.",
    author: "Antonio Ruiz",
    role: "Gerente",
    company: "Olivar del Sur",
    metric: "25% menos agua",
  },
  {
    quote:
      "El copilot nos ahorra horas de análisis cada semana. Ahora tomamos decisiones mucho más rápido.",
    author: "María López",
    role: "Técnico agrónomo",
    company: "Cooperativa San Juan",
    metric: "3h ahorradas al día",
  },
  {
    quote:
      "Sabía que perdía dinero en una parcela. Agropilot me lo confirmó con datos y pude corregirlo.",
    author: "Carlos Herrera",
    role: "Propietario",
    company: "Finca La Esperanza",
    metric: "18% más margen",
  },
  {
    quote:
      "Los precios del aceite en tiempo real nos ayudaron a vender en el momento justo de la campaña.",
    author: "Lucía Martín",
    role: "Directora",
    company: "Almazara El Pilar",
    metric: "+12% precio medio venta",
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length)
        setIsAnimating(false)
      }, 300)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0]!

  return (
    <section className="relative border-t border-foreground/10 py-32 lg:py-40 lg:pb-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Label */}
        <div className="mb-16 flex items-center gap-4">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Lo que dicen nuestros usuarios
          </span>
          <div className="h-px flex-1 bg-foreground/10" />
          <span className="font-mono text-xs text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main Quote */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-300 ${
                isAnimating
                  ? "translate-y-4 opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <p className="font-display text-4xl leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                "{activeTestimonial.quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div
              className={`mt-12 flex items-center gap-6 transition-all delay-100 duration-300 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5">
                <span className="font-display text-2xl text-foreground">
                  {activeTestimonial.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {activeTestimonial.author}
                </p>
                <p className="text-muted-foreground">
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Highlight */}
          <div className="flex flex-col justify-center lg:col-span-4">
            <div
              className={`border border-foreground/10 p-8 transition-all duration-300 ${
                isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              <span className="mb-4 block font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Resultado clave
              </span>
              <p className="font-display text-3xl text-foreground md:text-4xl">
                {activeTestimonial.metric}
              </p>
            </div>

            {/* Navigation Dots */}
            <div className="mt-8 flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true)
                    setTimeout(() => {
                      setActiveIndex(idx)
                      setIsAnimating(false)
                    }, 300)
                  }}
                  className={`h-2 transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 bg-foreground"
                      : "w-2 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Company Logos Marquee Label */}
        <div className="mt-24 border-t border-foreground/10 pt-12">
          <p className="mb-8 text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Confían en nosotros
          </p>
        </div>
      </div>

      {/* Full-width marquee outside container */}
      <div className="w-full">
        <div className="marquee flex items-center gap-16">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex shrink-0 items-center gap-16">
              {[
                "Olivar del Sur",
                "Cooperativa San Juan",
                "Finca La Esperanza",
                "Almazara El Pilar",
                "Campo Verde",
                "La Viñuela",
                "Sierra Morena",
                "Vega del Guadalquivir",
              ].map((company) => (
                <span
                  key={`${setIdx}-${company}`}
                  className="font-display text-xl whitespace-nowrap text-foreground/30 transition-colors duration-300 hover:text-foreground md:text-2xl"
                >
                  {company}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
