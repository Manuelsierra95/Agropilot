type SiteConfig = {
  name: string
  description: string
  url: string

  branding: {
    logo: string
    logoAlt: string
    favicon: string
  }

  social: {
    twitter?: string
    github?: string
    linkedin?: string
    facebook?: string
    instagram?: string
  }

  contact: {
    email: string
  }
}

export const siteConfig: SiteConfig = {
  name: "Agropilot",
  description: "Optimiza cultivos y procesos agrícolas",
  url: "https://agropilot.com",

  branding: {
    logo: "/logo.svg",
    logoAlt: "Agropilot logo",
    favicon: "/favicon.ico",
  },

  social: {
    twitter: "@agropilot",
    github: "https://github.com/agropilot",
  },

  contact: {
    email: "contact@agropilot.com",
  },
}
