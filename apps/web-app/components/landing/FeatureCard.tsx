'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  className?: string
  delay?: number
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  className = '',
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        delay,
        ease: 'easeOut',
      }}
      className={`relative p-6 md:p-8 bg-white border border-neutral-200 rounded-xl shadow-lg shadow-neutral-100/50 overflow-hidden ${className}`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-black mb-2">{title}</h3>
      <p className="text-neutral-600 text-base">{description}</p>
      <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-xl bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    </motion.div>
  )
}
