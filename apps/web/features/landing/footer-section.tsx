"use client"

import { ArrowUpRight } from "lucide-react"
import { AnimatedWave } from "@workspace/web/features/landing/animated-wave"

const footerLinks = {
  Producto: [
    { name: "Funcionalidades", href: "#features" },
    { name: "Cómo funciona", href: "#how-it-works" },
    { name: "Precios", href: "#pricing" },
    { name: "Precios del aceite", href: "#" },
  ],
  Agricultores: [
    { name: "Tu parcela en tiempo real", href: "#agricultores" },
    { name: "Riesgos y alertas", href: "#agricultores" },
    { name: "Recomendaciones IA", href: "#agricultores" },
    { name: "Resumen de campaña", href: "#agricultores" },
  ],
  Empresa: [
    { name: "Sobre nosotros", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contacto", href: "#" },
    { name: "Soporte", href: "#" },
  ],
  Legal: [
    { name: "Privacidad", href: "#" },
    { name: "Términos", href: "#" },
    { name: "Seguridad", href: "#security" },
  ],
}

const socialLinks = [
  { name: "Twitter", href: "#" },
  { name: "GitHub", href: "#" },
  { name: "LinkedIn", href: "#" },
]

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
              <a href="#" className="mb-6 inline-flex items-center gap-2">
                <span className="font-display text-2xl">Agropilot</span>
                <span className="font-mono text-xs text-muted-foreground">
                  TM
                </span>
              </a>

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
                        {"badge" in link && link.badge && (
                          <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                            {link.badge}
                          </span>
                        )}
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
            2025 Agropilot. Todos los derechos reservados.
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
