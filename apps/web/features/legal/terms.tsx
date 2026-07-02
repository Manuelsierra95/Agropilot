import {
  LegalDocument,
  type LegalSection,
} from "@workspace/web/features/legal/components/legal-document"

const sections: LegalSection[] = [
  {
    title: "1. Aceptacion de los terminos",
    paragraphs: [
      "Al registrarte o usar AgroPilot aceptas estos Terminos de Servicio y te comprometes a cumplir la normativa aplicable.",
      "Si no estas de acuerdo con alguna condicion, debes dejar de usar la plataforma.",
    ],
  },
  {
    title: "2. Objeto del servicio",
    paragraphs: [
      "AgroPilot ofrece herramientas digitales para la gestion de explotaciones agricolas, seguimiento operativo y apoyo a la toma de decisiones.",
      "Las funcionalidades pueden evolucionar para incorporar mejoras, nuevas integraciones y cambios de producto.",
    ],
  },
  {
    title: "3. Cuenta de usuario",
    paragraphs: [
      "Eres responsable de mantener la confidencialidad de tus credenciales y del uso de tu cuenta.",
      "Debes proporcionar informacion veraz y mantenerla actualizada para garantizar un uso correcto del servicio.",
    ],
    items: [
      "No compartir accesos con terceros no autorizados.",
      "Notificar usos sospechosos o accesos no reconocidos.",
      "Usar la plataforma conforme a la ley y a estos terminos.",
    ],
  },
  {
    title: "4. Uso permitido y restricciones",
    paragraphs: [
      "No se permite usar AgroPilot para actividades ilicitas, accesos no autorizados o interferencias sobre la infraestructura.",
      "Tampoco se permite intentar extraer codigo, datos o funcionalidades de forma automatizada sin autorizacion expresa.",
    ],
  },
  {
    title: "5. Datos y contenido del usuario",
    paragraphs: [
      "El usuario conserva la titularidad de los datos que introduce en la plataforma.",
      "Nos otorgas una licencia limitada para procesar esos datos exclusivamente con el fin de prestar, mantener y mejorar el servicio.",
    ],
  },
  {
    title: "6. Disponibilidad y cambios",
    paragraphs: [
      "Trabajamos para mantener alta disponibilidad, pero el servicio puede verse afectado por mantenimientos o incidencias tecnicas.",
      "Podemos modificar o retirar funcionalidades cuando sea necesario por razones tecnicas, legales o de producto.",
    ],
  },
  {
    title: "7. Propiedad intelectual",
    paragraphs: [
      "El software, el diseno, las marcas y la documentacion de AgroPilot pertenecen a sus titulares y estan protegidos por la normativa aplicable.",
      "No se concede ningun derecho de explotacion distinto del uso permitido expresamente en estos terminos.",
    ],
  },
  {
    title: "8. Limitacion de responsabilidad",
    paragraphs: [
      "AgroPilot se ofrece bajo una obligacion de medios y no garantiza resultados agronomicos o economicos concretos.",
      "En la medida permitida por la ley, no seremos responsables por danos indirectos, lucro cesante o perdidas derivadas del uso de la plataforma.",
    ],
  },
  {
    title: "9. Modificaciones de los terminos",
    paragraphs: [
      "Podemos actualizar estos terminos para reflejar cambios legales, tecnicos o comerciales.",
      "La version vigente estara disponible en esta pagina junto con la fecha de ultima actualizacion.",
    ],
  },
]

export function TermsDocument() {
  return (
    <LegalDocument
      title="Terminos de Servicio"
      description="Estos terminos regulan el acceso y uso de AgroPilot y de todas sus funcionalidades asociadas."
      lastUpdated="16 abril 2026"
      sections={sections}
    />
  )
}
