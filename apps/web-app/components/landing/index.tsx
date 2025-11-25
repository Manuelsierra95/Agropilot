'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/landing/Navbar' // Tu nuevo Navbar
import Hero from '@/components/landing/Hero'
import AnimatedBackground from '@/components/landing/AnimatedBackground' // Tu nuevo fondo
import Stats from '@/components/landing/Stats'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Benefits from '@/components/landing/Benefits'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

const SectionWrapper = ({
  children,
  className = '',
  id = '',
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className={`container mx-auto px-4 py-20 md:py-28 ${className}`}
  >
    {children}
  </motion.section>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen text-neutral-950 selection:bg-black selection:text-white font-sans">
      <Navbar />

      <main className="flex flex-col w-full">
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <AnimatedBackground />

          <div className="container mx-auto px-4 relative z-10">
            <Hero />
          </div>

          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
        </section>
        <SectionWrapper>
          <Stats />
        </SectionWrapper>

        <SectionWrapper id="caracteristicas">
          <Features />
        </SectionWrapper>

        <div className="bg-neutral-50/50 border-y border-neutral-100">
          <SectionWrapper id="como-funciona">
            <HowItWorks />
          </SectionWrapper>
        </div>

        <SectionWrapper id="beneficios">
          <Benefits />
        </SectionWrapper>

        <SectionWrapper id="testimonios">
          <Testimonials />
        </SectionWrapper>

        <SectionWrapper className="mb-20">
          <CTA />
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  )
}
