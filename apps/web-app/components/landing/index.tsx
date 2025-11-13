import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import CTAButtons from '@/components/landing/CTAButtons'
import Stats from '@/components/landing/Stats'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Benefits from '@/components/landing/Benefits'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <Navbar />

      <main>
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <Hero />
            <CTAButtons />
          </div>
        </section>

        <section className="container mx-auto px-4">
          <Stats />
        </section>

        <section id="features" className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center">
            <Features />
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-green-50">
          <div className="flex flex-col items-center">
            <HowItWorks />
          </div>
        </section>

        <section id="benefits" className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center">
            <Benefits />
          </div>
        </section>

        <section
          id="testimonials"
          className="container mx-auto px-4 py-20 bg-white"
        >
          <div className="flex flex-col items-center">
            <Testimonials />
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center">
            <CTA />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
