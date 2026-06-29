import { Navigation } from "@workspace/web/features/landing/navigation"
import { HeroSection } from "@workspace/web/features/landing/hero-section"
import { FeaturesSection } from "@workspace/web/features/landing/features-section"
import { HowItWorksSection } from "@workspace/web/features/landing/how-it-works-section"
import { InfrastructureSection } from "@workspace/web/features/landing/infrastructure-section"
import { MetricsSection } from "@workspace/web/features/landing/metrics-section"
import { IntegrationsSection } from "@workspace/web/features/landing/integrations-section"
import { SecuritySection } from "@workspace/web/features/landing/security-section"
import { DevelopersSection } from "@workspace/web/features/landing/developers-section"
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
