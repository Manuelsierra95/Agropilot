import { Metadata } from "next"
import { PrivacyDocument } from "@workspace/web/features/legal/privacy"

export const metadata: Metadata = {
  title: "Politica de privacidad | AgroPilot",
  description:
    "Conoce como AgroPilot recopila, usa y protege tus datos personales y operativos dentro de la plataforma.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Politica de privacidad | AgroPilot",
    description:
      "Informacion sobre tratamiento de datos personales, seguridad y derechos de los usuarios en AgroPilot.",
    url: "/privacy",
    siteName: "AgroPilot",
    locale: "es_ES",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Politica de privacidad | AgroPilot",
    description:
      "Tratamiento de datos, seguridad y derechos de privacidad en AgroPilot.",
  },
  keywords: [
    "agropilot",
    "privacidad",
    "politica de privacidad",
    "proteccion de datos",
    "agricultura digital",
  ],
}

export default function PrivacyPage() {
  return <PrivacyDocument />
}
