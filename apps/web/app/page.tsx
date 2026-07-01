import { Navigation } from "@workspace/web/features/landing/navigation"
import { HeroSection } from "@workspace/web/features/landing/hero-section"
import { FeaturesSection } from "@workspace/web/features/landing/features-section"
import { HowItWorksSection } from "@workspace/web/features/landing/how-it-works-section"
import { DataSection } from "@workspace/web/features/landing/data-section"
import { AppFeaturesSection } from "@workspace/web/features/landing/app-features-section"
import { TestimonialsSection } from "@workspace/web/features/landing/testimonials-section"
import { PricingSection } from "@workspace/web/features/landing/pricing-section"
import { CtaSection } from "@workspace/web/features/landing/cta-section"
import { FooterSection } from "@workspace/web/features/landing/footer-section"

export default function Landing() {
  return (
    <main className="noise-overlay relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DataSection />
      <AppFeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
