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

export const navigation: Navigation = {
  links: [
    { name: "Features", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Developers", href: "#developers" },
    { name: "Pricing", href: "#pricing" },
  ],
  cta: {
    signUp: {
      name: "Registrate",
      href: "/auth/sign-in",
    },
    signIn: {
      name: "Inicia sesión",
      href: "/dashboard",
    },
  },
  login: {
    name: "Inicia sesión",
    href: "/dashboard",
  },
  register: {
    name: "Registrate",
    href: "/auth/sign-in",
  },
}
