export default function Benefits() {
  const benefits = [
    {
      number: '01',
      title: 'Ahorra Tiempo',
      description:
        'Automatiza tareas repetitivas y reduce el tiempo de gestión administrativa hasta en un 60%.',
    },
    {
      number: '02',
      title: 'Aumenta Productividad',
      description:
        'Toma decisiones más rápidas e informadas con datos en tiempo real sobre tus cultivos.',
    },
    {
      number: '03',
      title: 'Maximiza Beneficios',
      description:
        'Optimiza recursos, reduce costos y mejora la rentabilidad de tu explotación agrícola.',
    },
    {
      number: '04',
      title: 'Control Total',
      description:
        'Ten visibilidad completa de todas tus operaciones desde cualquier lugar, en cualquier momento.',
    },
  ]

  return (
    <section className="w-full max-w-7xl py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
          ¿Por qué elegir Agropilot?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Miles de agricultores ya confían en nosotros para gestionar sus
          explotaciones de manera más eficiente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {benefits.map((benefit) => (
          <div
            key={benefit.number}
            className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all duration-300"
          >
            <div className="flex items-start gap-6">
              <div className="text-5xl font-bold text-green-200">
                {benefit.number}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
