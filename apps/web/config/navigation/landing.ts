import { siteConfig } from "@workspace/web/config/app/site"

type NavLink = {
  name: string
  href: string
}

type Navigation = {
  links: NavLink[]
  cta: {
    signUp: NavLink
    signIn: NavLink
  }
  login: NavLink
  register: NavLink
}

export const landingRoutes = {
  home: "/",
  signIn: "/auth/sign-in",
  dashboard: "/dashboard",
  privacy: "/privacy",
  terms: "/terms",
  contact: `mailto:${siteConfig.contact.email}`,
  features: "#features",
  howItWorks: "#how-it-works",
  agricultores: "#agricultores",
  pricing: "#pricing",
} as const

export const navigation: Navigation = {
  links: [
    { name: "Funcionalidades", href: landingRoutes.features },
    { name: "Cómo funciona", href: landingRoutes.howItWorks },
    { name: "Agricultores", href: landingRoutes.agricultores },
    { name: "Precios", href: landingRoutes.pricing },
  ],
  cta: {
    signUp: {
      name: "Registrate",
      href: landingRoutes.signIn,
    },
    signIn: {
      name: "Inicia sesión",
      href: landingRoutes.signIn,
    },
  },
  login: {
    name: "Inicia sesión",
    href: landingRoutes.signIn,
  },
  register: {
    name: "Registrate",
    href: landingRoutes.signIn,
  },
}
