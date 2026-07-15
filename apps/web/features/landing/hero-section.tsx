"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "lucide-react"
import { landingRoutes } from "@workspace/web/config/navigation/landing"
import { SeamlessVideo } from "./seamless-video"

const words = ["decidir", "gestionar", "anticipar", "rentabilizar"]

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      <SeamlessVideo
        src="/ascii-flower.webm"
        fadeSeconds={1}
        visible={isVisible}
        maxOpacity={0.4}
        appearDuration={1000}
        bottomFade
        className="pointer-events-none absolute top-1/2 right-0 h-[600px] w-[600px] -translate-y-1/2 opacity-40 lg:h-[800px] lg:w-[800px]"
      />

      {/* Subtle grid lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-32 lg:px-12 lg:py-40">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <span className="h-px w-8 bg-foreground/30" />
            La plataforma para el cultivo moderno
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-12">
          <h1
            className={`font-display text-[clamp(3rem,12vw,10rem)] leading-[0.9] tracking-tight transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <span className="block">La plataforma</span>
            <span className="block">
              para{" "}
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="animate-char-in inline-block"
                      style={{
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute right-0 -bottom-2 left-0 h-3 bg-foreground/10" />
              </span>
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-24">
          <p
            className={`max-w-xl text-xl leading-relaxed text-muted-foreground transition-all delay-200 duration-700 lg:text-2xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Controla tus parcelas, anticipa riesgos y maximiza tu margen. Datos
            meteorológicos, precios del aceite e inteligencia artificial en un
            solo lugar.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col items-start gap-4 transition-all delay-300 duration-700 sm:flex-row ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <Button
              size="lg"
              className="group h-14 rounded-full bg-foreground px-8 text-base text-background hover:bg-foreground/90"
              asChild
            >
              <Link href={landingRoutes.signIn}>
                Empieza gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-foreground/20 px-8 text-base hover:bg-foreground/5"
              asChild
            >
              <Link href={landingRoutes.demo}>Ver demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats marquee - full width outside container */}
      <div
        className={`absolute right-0 bottom-24 left-0 transition-all delay-500 duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="marquee flex gap-16 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {[
                {
                  value: "30%",
                  label: "menos agua utilizada",
                  company: "Cooperativa del Campo",
                },
                {
                  value: "15%",
                  label: "más margen por campaña",
                  company: "Finca La Esperanza",
                },
                {
                  value: "48h",
                  label: "antes alerta de fungicidad",
                  company: "Olivar del Sur",
                },
                {
                  value: "2.847",
                  label: "olivares gestionados",
                  company: "Agropilot",
                },
              ].map((stat) => (
                <div
                  key={`${stat.company}-${i}`}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-display text-4xl lg:text-5xl">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                    <span className="mt-1 block font-mono text-xs">
                      {stat.company}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
    </section>
  )
}
