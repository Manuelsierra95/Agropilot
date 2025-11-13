export default function Testimonials() {
  const testimonials = [
    {
      name: 'Carlos Rodríguez',
      role: 'Agricultor en Andalucía',
      content:
        'Agropilot ha transformado completamente la forma en que gestiono mis 50 hectáreas. Ahora tengo todo bajo control y puedo tomar mejores decisiones.',
      avatar: '👨‍🌾',
    },
    {
      name: 'María González',
      role: 'Gerente de Cooperativa',
      content:
        'La mejor inversión que hemos hecho. Hemos mejorado nuestra eficiencia operativa y aumentado la rentabilidad de todos nuestros asociados.',
      avatar: '👩‍💼',
    },
    {
      name: 'Juan Martínez',
      role: 'Productor de Olivar',
      content:
        'Intuitivo, potente y exactamente lo que necesitaba. El control financiero me ha ayudado a reducir costos significativamente.',
      avatar: '👨‍🌾',
    },
  ]

  return (
    <section className="w-full max-w-7xl py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="text-xl text-gray-600">
          Agricultores que han revolucionado su forma de trabajar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-lg border border-green-100"
          >
            <div className="text-5xl mb-4">{testimonial.avatar}</div>
            <p className="text-gray-700 mb-6 italic leading-relaxed">
              &ldquo;{testimonial.content}&rdquo;
            </p>
            <div className="border-t border-green-100 pt-4">
              <div className="font-bold text-green-900">{testimonial.name}</div>
              <div className="text-sm text-gray-600">{testimonial.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
