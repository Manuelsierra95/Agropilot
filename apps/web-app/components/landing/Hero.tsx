'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 mb-8"
      >
        <span className="flex h-2 w-2 rounded-full bg-black mr-2 animate-pulse"></span>
        La revolución de Agropilot
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold tracking-tight text-black mb-6 leading-[1.1]"
      >
        Gestiona tu cultivo <br className="hidden md:block" />
        con <span className="text-neutral-500">precisión absoluta.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl leading-relaxed"
      >
        Optimiza recursos, monitoriza en tiempo real y toma decisiones basadas
        en datos. Todo desde una plataforma unificada.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        className="mt-16 w-full relative"
      >
        <div className="relative rounded-xl md:rounded-2xl border border-neutral-200 bg-neutral-100/50 p-2 md:p-4 shadow-2xl shadow-neutral-200/50">
          <div className="relative aspect-video overflow-hidden rounded-lg md:rounded-xl bg-white border border-neutral-200 flex items-center justify-center group cursor-pointer">
            <img
              src="/dashboard-preview.png"
              alt="Vista previa del Dashboard"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          </div>
        </div>
        {/* <div className="relative rounded-xl md:rounded-2xl border border-neutral-200 bg-neutral-100/50 p-2 md:p-4 shadow-2xl shadow-neutral-200/50">
          <div className="relative aspect-video overflow-hidden rounded-lg md:rounded-xl bg-white border border-neutral-200 flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-neutral-50 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-neutral-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-neutral-500 border-b-[10px] border-b-transparent ml-1"></div>
              </div>
              <p className="text-neutral-400 font-medium">
                Vista previa del Dashboard
              </p>
              <p className="text-neutral-300 text-sm mt-2">1920 x 1080</p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          </div>
        </div> */}

        <div className="absolute -inset-4 bg-gradient-to-r from-neutral-200 to-neutral-100 opacity-30 blur-2xl -z-10 rounded-[3rem]"></div>
      </motion.div>
    </div>
  )
}
