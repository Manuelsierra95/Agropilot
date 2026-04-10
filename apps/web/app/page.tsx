import { Navigation } from "@/features/landing/navigation"
import { HeroSection } from "@/features/landing/hero-section"
import { FeaturesSection } from "@/features/landing/features-section"
import { HowItWorksSection } from "@/features/landing/how-it-works-section"
import { InfrastructureSection } from "@/features/landing/infrastructure-section"
import { MetricsSection } from "@/features/landing/metrics-section"
import { IntegrationsSection } from "@/features/landing/integrations-section"
import { SecuritySection } from "@/features/landing/security-section"
import { DevelopersSection } from "@/features/landing/developers-section"
import { TestimonialsSection } from "@/features/landing/testimonials-section"
import { PricingSection } from "@/features/landing/pricing-section"
import { CtaSection } from "@/features/landing/cta-section"
import { FooterSection } from "@/features/landing/footer-section"

export default function Landing() {
  return (
    <main className="noise-overlay relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
