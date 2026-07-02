import {
  LegalDocument,
  type LegalSection,
} from "@workspace/web/features/legal/components/legal-document"

const sections: LegalSection[] = [
  {
    title: "1. Responsable del tratamiento",
    paragraphs: [
      "AgroPilot actua como responsable del tratamiento de los datos personales que nos facilitas al crear una cuenta, usar la plataforma o contactar con soporte.",
      "Puedes escribirnos para cualquier consulta relacionada con privacidad a traves de los canales de contacto disponibles en la aplicacion.",
    ],
  },
  {
    title: "2. Datos que recopilamos",
    paragraphs: [
      "Recopilamos datos de cuenta como nombre, correo electronico y proveedor de autenticacion para gestionar el acceso seguro.",
      "Tambien procesamos datos de uso de la plataforma como informacion de parcelas, registros operativos y metricas de interaccion para mostrar analisis utiles.",
    ],
    items: [
      "Datos de identificacion y acceso (correo, nombre, credenciales externas).",
      "Datos agronomicos y operativos que el usuario carga en su espacio.",
      "Datos tecnicos basicos de dispositivo, navegador y logs de seguridad.",
    ],
  },
  {
    title: "3. Finalidades del tratamiento",
    paragraphs: [
      "Usamos los datos para prestar el servicio principal de AgroPilot, incluyendo paneles de control, analitica de explotacion y soporte tecnico.",
      "Tambien podemos usar informacion agregada y anonimizada para mejorar funcionalidades, rendimiento y estabilidad del producto.",
    ],
  },
  {
    title: "4. Base juridica",
    paragraphs: [
      "La base principal es la ejecucion del contrato de uso de la plataforma y, cuando aplique, el consentimiento del usuario para finalidades especificas.",
      "En determinados casos tratamos informacion por interes legitimo para prevenir fraude, proteger la infraestructura y responder a incidencias.",
    ],
  },
  {
    title: "5. Conservacion de datos",
    paragraphs: [
      "Conservamos los datos personales durante el tiempo necesario para prestar el servicio y cumplir obligaciones legales o contractuales.",
      "Cuando una cuenta se elimina, se aplican periodos de retencion tecnica limitados para auditoria, seguridad y continuidad operativa.",
    ],
  },
  {
    title: "6. Comparticion y encargados",
    paragraphs: [
      "No vendemos datos personales. Compartimos informacion solo con proveedores necesarios para operar la plataforma, como hosting, autenticacion y monitorizacion.",
      "Todos los proveedores actuan bajo acuerdos de tratamiento y con medidas de seguridad proporcionadas al riesgo.",
    ],
  },
  {
    title: "7. Derechos de los usuarios",
    paragraphs: [
      "Puedes ejercer derechos de acceso, rectificacion, supresion, oposicion, limitacion y portabilidad cuando sean aplicables.",
      "Tambien puedes retirar tu consentimiento en cualquier momento para tratamientos que dependan de este.",
    ],
  },
  {
    title: "8. Seguridad",
    paragraphs: [
      "Aplicamos controles tecnicos y organizativos para proteger la confidencialidad, integridad y disponibilidad de los datos.",
      "Esto incluye controles de acceso, registros de actividad y practicas de desarrollo seguro en nuestros sistemas.",
    ],
  },
  {
    title: "9. Cambios en esta politica",
    paragraphs: [
      "Podemos actualizar esta politica para reflejar mejoras del servicio, cambios legales o nuevos tratamientos.",
      "Publicaremos la version vigente en esta pagina e indicaremos la fecha de ultima actualizacion.",
    ],
  },
]

export function PrivacyDocument() {
  return (
    <LegalDocument
      title="Politica de Privacidad"
      description="Esta Politica explica como tratamos los datos personales y operativos que compartes al usar AgroPilot."
      lastUpdated="16 abril 2026"
      sections={sections}
    />
  )
}
