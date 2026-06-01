import Link from "next/link"

export const metadata = {
  title: "404 | Pagina no encontrada",
  description: "La pagina que buscas no existe o fue movida.",
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,114,239,0.08),transparent_50%),radial-gradient(circle_at_bottom,rgba(255,91,79,0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:120px_120px] opacity-30" />

      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-start justify-center gap-10 px-6 py-24 md:px-10">
        <div className="inline-flex items-center gap-3 rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium tracking-[0.2em] text-neutral-600 uppercase">
          <span className="h-2 w-2 rounded-full bg-[#0a72ef]" />
          Estado 404
        </div>

        <div className="space-y-5">
          <p className="text-6xl font-semibold tracking-[-0.08em] text-neutral-900 md:text-7xl">
            Pagina no encontrada
          </p>
          <p className="max-w-xl text-base text-neutral-600 md:text-lg">
            La ruta que intentas abrir no existe o fue movida. Revisa el enlace
            o vuelve al inicio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition hover:bg-neutral-800"
          >
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition hover:bg-neutral-100"
          >
            Ir al dashboard
          </Link>
        </div>

        <div className="font-mono text-sm tracking-[0.3em] text-neutral-500 uppercase">
          error // missing-route
        </div>
      </section>
    </main>
  )
}
