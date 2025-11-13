import Link from 'next/link'

export default function CTAButtons() {
  return (
    <div className="pt-8 flex gap-6 flex-wrap justify-center items-center">
      <Link href="/dashboard">
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-10 py-5 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
          Comenzar Ahora →
        </button>
      </Link>
      <Link href="/login">
        <button className="bg-white hover:bg-gray-50 text-green-600 font-bold text-lg px-10 py-5 rounded-xl shadow-lg border-2 border-green-600 transition-all duration-300 transform hover:scale-105">
          Iniciar Sesión
        </button>
      </Link>
    </div>
  )
}
