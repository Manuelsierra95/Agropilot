import FeatureCard from '@/components/landing/FeatureCard'

const features = [
  {
    icon: '�️',
    title: 'Gestión de Parcelas',
    description:
      'Visualiza, administra y monitorea todas tus parcelas desde un solo lugar. Información centralizada y accesible.',
  },
  {
    icon: '📅',
    title: 'Calendario de Eventos',
    description:
      'Planifica siembras, cosechas, tratamientos y tareas. Nunca pierdas de vista las actividades importantes.',
  },
  {
    icon: '�',
    title: 'Métricas y Análisis',
    description:
      'Estadísticas en tiempo real sobre rendimiento, producción y eficiencia. Decisiones basadas en datos.',
  },
  {
    icon: '💰',
    title: 'Control Financiero',
    description:
      'Gestiona gastos, ingresos y optimiza la rentabilidad. Mantén tu negocio agrícola saludable financieramente.',
  },
  {
    icon: '⚡',
    title: 'Acceso en Tiempo Real',
    description:
      'Accede a tu información desde cualquier dispositivo, en cualquier momento. Tu granja siempre contigo.',
  },
  {
    icon: '🔒',
    title: 'Seguro y Confiable',
    description:
      'Tus datos están protegidos con la más alta seguridad. Respaldos automáticos y arquitectura confiable.',
  },
]

export default function Features() {
  return (
    <div className="w-full max-w-7xl pt-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
          Todo lo que necesitas para gestionar tu explotación
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Herramientas profesionales diseñadas específicamente para el sector
          agrícola moderno
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  )
}
