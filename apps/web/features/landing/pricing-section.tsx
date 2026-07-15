"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { landingRoutes } from "@workspace/web/config/navigation/landing"

const plans = [
  {
    name: "Gratis",
    description: "Para olivicultores que empiezan",
    price: { monthly: 0, annual: 0 },
    features: [
      "Hasta 2 parcelas",
      "Datos meteorológicos básicos",
      "Precio del aceite en tiempo real",
      "1 usuario",
      "Soporte por comunidad",
    ],
    cta: "Empieza gratis",
    href: landingRoutes.signIn,
    popular: false,
  },
  {
    name: "Pro",
    description: "Para olivares en crecimiento",
    price: { monthly: 29, annual: 24 },
    features: [
      "Parcelas ilimitadas",
      "Copilot IA agrícola",
      "Alertas de riesgo avanzadas",
      "Gestión financiera completa",
      "Informe de campaña",
      "Hasta 5 usuarios",
      "Soporte prioritario",
    ],
    cta: "Empieza la prueba",
    href: landingRoutes.signIn,
    popular: true,
  },
  {
    name: "Empresa",
    description: "Para cooperativas y grandes explotaciones",
    price: { monthly: null, annual: null },
    features: [
      "Todo lo incluido en Pro",
      "Multi-explotación",
      "API personalizada",
      "Integración con cooperativas",
      "Usuarios ilimitados",
      "SLA garantizado",
      "Formación incluida",
      "Soporte dedicado",
    ],
    cta: "Contactar",
    href: landingRoutes.contact,
    popular: false,
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <section
      id="pricing"
      className="relative border-t border-foreground/10 py-32 lg:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <span className="mb-6 block font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Precios
          </span>
          <h2 className="font-display mb-6 text-5xl tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Simples y transparentes
            <br />
            <span className="text-stroke">para tu olivar</span>
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            Empieza gratis y escala según crezca tu explotación. Sin sorpresas.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-16 flex items-center gap-4">
          <span
            className={`text-sm transition-colors ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Mensual
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-7 w-14 rounded-full bg-foreground/10 p-1 transition-colors hover:bg-foreground/20"
          >
            <div
              className={`h-5 w-5 rounded-full bg-foreground transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm transition-colors ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Anual
          </span>
          {isAnnual && (
            <span className="ml-2 bg-foreground px-2 py-1 font-mono text-xs text-primary-foreground">
              Save 17%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-px bg-foreground/10 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative bg-background p-8 lg:p-12 ${
                plan.popular
                  ? "border-2 border-foreground md:-my-4 md:py-12 lg:py-16"
                  : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 bg-foreground px-3 py-1 font-mono text-xs tracking-widest text-primary-foreground uppercase">
                  Más popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-2 text-3xl text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 border-b border-foreground/10 pb-8">
                {plan.price.monthly !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl text-foreground lg:text-6xl">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <span className="font-display text-4xl text-foreground">
                    Custom
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="mb-10 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`group flex w-full items-center justify-center gap-2 py-4 text-sm font-medium transition-all ${
                  plan.popular
                    ? "bg-foreground text-primary-foreground hover:bg-foreground/90"
                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Todos los planes incluyen datos meteorológicos, precios de mercado y
          actualizaciones automáticas.{" "}
          <a
            href={landingRoutes.features}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Comparar todas las funcionalidades
          </a>
        </p>
      </div>
    </section>
  )
}
