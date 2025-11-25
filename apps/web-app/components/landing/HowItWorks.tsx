'use client'

import React from 'react'
import { motion, easeOut } from 'framer-motion'

type Step = {
  step: string
  title: string
  description: string
  icon: string
}

const steps: Step[] = [
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

const parentVariants = {
  hidden: {},

  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.6,
    },
  },
}

const circleVariants = {
  hidden: {
    backgroundColor: '#FFFFFF',
    color: '#171717',
  },
  visible: {
    backgroundColor: '#171717',
    color: '#FFFFFF',
    transition: {
      duration: 2,
      ease: easeOut,
    },
  },
}

export default function HowItWorks() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={parentVariants}
      viewport={{ once: true, margin: '-100px' }}
      className="w-full max-w-7xl mx-auto py-20"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Comienza en 3 simples pasos
        </h2>
        <p className="text-lg md:text-xl text-neutral-600">
          Estarás operativo en minutos, no en días
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative pt-8 md:pt-0">
        {steps.map((item, index) => (
          <div key={item.step} className="relative">
            <div className="flex flex-col items-center text-center">
              {/* Círculo del número del paso: Contenedor para la animación de color */}
              <motion.div
                variants={circleVariants}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 relative z-20 
                border-2 border-neutral-300`}
              >
                {item.step}
              </motion.div>

              {/* Contenido estático */}
              <div className="text-5xl mb-4">{item.icon}</div>

              <h3 className="text-xl font-bold text-black mb-3">
                {item.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
