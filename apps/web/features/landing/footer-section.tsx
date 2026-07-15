"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { AnimatedWave } from "@workspace/web/features/landing/animated-wave"
import { siteConfig } from "@workspace/web/config/app/site"
import { landingRoutes } from "@workspace/web/config/navigation/landing"

const footerLinks = {
  Producto: [
    { name: "Funcionalidades", href: landingRoutes.features },
    { name: "Cómo funciona", href: landingRoutes.howItWorks },
    { name: "Precios", href: landingRoutes.pricing },
    { name: "Precios del aceite", href: landingRoutes.agricultores },
  ],
  Agricultores: [
    { name: "Tu parcela en tiempo real", href: landingRoutes.agricultores },
    { name: "Riesgos y alertas", href: landingRoutes.agricultores },
    { name: "Recomendaciones IA", href: landingRoutes.agricultores },
    { name: "Resumen de campaña", href: landingRoutes.agricultores },
  ],
  Empresa: [
    { name: "Sobre nosotros", href: landingRoutes.home },
    { name: "Contacto", href: landingRoutes.contact },
    { name: "Soporte", href: landingRoutes.contact },
  ],
  Legal: [
    { name: "Privacidad", href: landingRoutes.privacy },
    { name: "Términos", href: landingRoutes.terms },
    { name: "Seguridad", href: landingRoutes.features },
  ],
}

const socialLinks = [
  {
    name: "Twitter",
    href: siteConfig.social.twitter
      ? `https://twitter.com/${siteConfig.social.twitter.replace("@", "")}`
      : undefined,
  },
  { name: "GitHub", href: siteConfig.social.github },
].filter((link): link is { name: string; href: string } => Boolean(link.href))

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="pointer-events-none absolute inset-0 h-64 overflow-hidden opacity-20">
        <AnimatedWave />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-6 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link
                href={landingRoutes.home}
                className="mb-6 inline-flex items-center gap-2"
              >
                <span className="font-display text-2xl">{siteConfig.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  TM
                </span>
              </Link>

              <p className="mb-8 max-w-xs leading-relaxed text-muted-foreground">
                La plataforma inteligente para el olivar moderno. Monitoriza,
                anticipa y optimiza cada aspecto de tu explotación.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-6 text-sm font-medium">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/10 py-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            2025 {siteConfig.name}. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Todos los sistemas operativos
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
