import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">
              🌾
            </span>
            <span className="text-2xl font-bold text-green-900">Agropilot</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Características
            </a>
            <a
              href="#benefits"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Beneficios
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Testimonios
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                Iniciar Sesión
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md">
                Comenzar
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
