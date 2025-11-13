export default function Stats() {
  const stats = [
    { value: '500+', label: 'Agricultores Activos' },
    { value: '10K+', label: 'Parcelas Gestionadas' },
    { value: '50K+', label: 'Eventos Programados' },
    { value: '99.9%', label: 'Uptime Garantizado' },
  ]

  return (
    <section className="w-full bg-green-900 py-16 px-4 rounded-3xl my-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-green-100 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
