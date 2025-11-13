export default function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Regístrate',
      description:
        'Crea tu cuenta en menos de 2 minutos. Sin tarjeta de crédito, sin compromisos.',
      icon: '✍️',
    },
    {
      step: '2',
      title: 'Configura tus Parcelas',
      description:
        'Añade tus parcelas, define cultivos y establece los parámetros de tu explotación.',
      icon: '⚙️',
    },
    {
      step: '3',
      title: 'Empieza a Gestionar',
      description:
        'Registra eventos, controla gastos, visualiza métricas y toma mejores decisiones.',
      icon: '🚀',
    },
  ]

  return (
    <section className="w-full max-w-7xl py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
          Comienza en 3 simples pasos
        </h2>
        <p className="text-xl text-gray-600">
          Estarás operativo en minutos, no en días
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-green-200 via-green-400 to-green-200"></div>

        {steps.map((item) => (
          <div key={item.step} className="relative">
            <div className="flex flex-col items-center text-center">
              {/* Step number circle */}
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg relative z-10">
                {item.step}
              </div>

              {/* Icon */}
              <div className="text-6xl mb-4">{item.icon}</div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-green-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
