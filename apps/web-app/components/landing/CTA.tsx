import Link from 'next/link'

export default function CTA() {
  return (
    <section className="w-full max-w-7xl py-20">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          ¿Listo para transformar tu explotación agrícola?
        </h2>
        <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-3xl mx-auto">
          Únete a cientos de agricultores que ya están optimizando su trabajo
          con Agropilot
        </p>
        <div className="flex gap-6 flex-wrap justify-center items-center">
          <Link href="/dashboard">
            <button className="bg-white hover:bg-gray-50 text-green-600 font-bold text-lg px-12 py-5 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105">
              Comenzar Gratis
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-green-800 hover:bg-green-900 text-white font-bold text-lg px-12 py-5 rounded-xl shadow-xl border-2 border-white transition-all duration-300 transform hover:scale-105">
              Ver Demo
            </button>
          </Link>
        </div>
        <p className="text-green-100 mt-8 text-sm">
          No necesitas tarjeta de crédito • Configuración en 5 minutos
        </p>
      </div>
    </section>
  )
}
