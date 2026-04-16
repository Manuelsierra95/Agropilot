import { Metadata } from "next"
import { TermsDocument } from "@/features/legal/terms"

export const metadata: Metadata = {
  title: "Terminos de servicio | AgroPilot",
  description:
    "Consulta los terminos que regulan el uso de AgroPilot, incluyendo acceso, responsabilidades y condiciones del servicio.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terminos de servicio | AgroPilot",
    description:
      "Condiciones de uso de AgroPilot para cuentas, datos, disponibilidad y responsabilidades.",
    url: "/terms",
    siteName: "AgroPilot",
    locale: "es_ES",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Terminos de servicio | AgroPilot",
    description: "Reglas y condiciones de uso de la plataforma AgroPilot.",
  },
  keywords: [
    "agropilot",
    "terminos",
    "terminos de servicio",
    "condiciones de uso",
    "agricultura digital",
  ],
}

export default function TermsPage() {
  return <TermsDocument />
}
