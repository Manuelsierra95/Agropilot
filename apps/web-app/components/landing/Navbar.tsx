'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 50) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  })

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-neutral-200/50 py-3'
          : 'bg-transparent py-5'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-950">
            Agropilot
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            'Características',
            'Cómo funciona',
            'Beneficios',
            'Testimonios',
          ].map((item) => {
            const normalized = item
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .replace(/\s+/g, '-')
            return (
              <Link
                key={item}
                href={`#${normalized}`}
                className="text-sm font-medium text-neutral-600 hover:text-black transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block text-sm font-medium text-neutral-600 hover:text-black transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-500/20 hover:shadow-neutral-500/40"
          >
            Demo
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
