'use client'

import {
  motion,
  useMotionValue,
  useTransform,
  useInView,
  useSpring,
} from 'framer-motion'
import { useEffect, useRef } from 'react'

function AnimatedNumber({
  value,
  suffix,
  decimals = 0,
}: {
  value: number
  suffix: string
  decimals?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const motionValue = useMotionValue(0)

  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 400,
    mass: 1,
  })

  const displayValue = useTransform(springValue, (latest) => {
    return latest.toFixed(decimals) + suffix
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  return (
    <motion.div
      ref={ref}
      className="text-4xl md:text-5xl font-bold text-black mb-2"
    >
      {displayValue}
    </motion.div>
  )
}

export default function Stats() {
  const stats = [
    {
      numericValue: 500,
      suffix: '+',
      label: 'Agricultores Activos',
      decimals: 0,
    },
    {
      numericValue: 1000,
      suffix: '+',
      label: 'Parcelas Gestionadas',
      decimals: 0,
    },
    {
      numericValue: 5000,
      suffix: '+',
      label: 'Eventos Programados',
      decimals: 0,
    },
    {
      numericValue: 99.9,
      suffix: '%',
      label: 'Uptime Garantizado',
      decimals: 1,
    },
  ]

  return (
    <section className="w-full py-16 px-4 my-10 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 border-r md:border-r-0 last:border-r-0 border-neutral-100" // Añade sutiles separadores verticales
            >
              <AnimatedNumber
                value={stat.numericValue}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
              <div className="text-neutral-600 text-sm md:text-base mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
