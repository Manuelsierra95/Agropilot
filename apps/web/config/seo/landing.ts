import type { Metadata } from "next"

export const landingMetadata: Metadata = {
  title: "Agropilot - Tu campo, decisiones claras",
  description:
    "La plataforma para agricultores que transforma datos complejos en decisiones prácticas. Riego, venta, costes y rentabilidad de tu olivar.",
  keywords: ["agricultura", "automatización", "agrotech"],
  openGraph: {
    title: "Agropilot",
    description: "Optimiza cultivos, datos y procesos agrícolas con Agropilot.",
    url: "https://agropilot.com",
    images: ["/og-image.png"],
  },
}
