import FeatureCard from '@/components/landing/FeatureCard'

const features = [
  {
    id: 1,
    icon: '🗺️',
    title: 'Gestión de Parcelas',
    description:
      'Visualiza, administra y monitorea todas tus parcelas desde un solo lugar. Información centralizada y accesible.',
    bentoClass: 'md:row-span-2',
  },
  {
    id: 2,
    icon: '📅',
    title: 'Calendario de Eventos',
    description:
      'Planifica siembras, cosechas, tratamientos y tareas. Nunca pierdas de vista las actividades importantes.',
    bentoClass: 'md:col-span-2',
  },
  {
    id: 3,
    icon: '📈',
    title: 'Métricas y Análisis',
    description:
      'Estadísticas en tiempo real sobre rendimiento, producción y eficiencia. Decisiones basadas en datos.',
    bentoClass: 'md:col-span-2',
  },
  {
    id: 4,
    icon: '💰',
    title: 'Control Financiero',
    description:
      'Gestiona gastos, ingresos y optimiza la rentabilidad. Mantén tu negocio agrícola saludable financieramente.',
    bentoClass: '',
  },
  {
    id: 5,
    icon: '⚡',
    title: 'Acceso en Tiempo Real',
    description:
      'Accede a tu información desde cualquier dispositivo, en cualquier momento. Tu granja siempre contigo.',
    bentoClass: '',
  },
  {
    id: 6,
    icon: '🔒',
    title: 'Seguro y Confiable',
    description:
      'Tus datos están protegidos con la más alta seguridad. Respaldos automáticos y arquitectura confiable.',
    bentoClass: '',
  },
]

export default function Features() {
  const animationOrder = [3, 4, 1, 5, 6, 2]

  return (
    <div className="w-full max-w-7xl mx-auto pt-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Herramientas de Precisión 🧑‍🌾
        </h2>
        <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto">
          Todo lo que necesitas para gestionar tu explotación, con un diseño
          intuitivo y minimalista.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 md:gap-6 auto-rows-fr">
        {animationOrder.map((id, idx) => {
          const feature = features.find((f) => f.id === id)
          if (!feature) return null

          const delay = idx * 0.2
          return (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={delay}
              className={feature.bentoClass}
            />
          )
        })}
      </div>
    </div>
  )
}
