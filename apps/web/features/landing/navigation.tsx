"use client"

import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Menu, X } from "lucide-react"

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Developers", href: "#developers" },
  { name: "Pricing", href: "#pricing" },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 right-4 left-4" : "top-0 right-0 left-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "max-w-[1200px] rounded-2xl border border-foreground/10 bg-background/80 shadow-lg backdrop-blur-xl"
            : "max-w-[1400px] bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-500 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="#" className="group flex items-center gap-2">
            <span
              className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}
            >
              Agropilot
            </span>
            <span
              className={`font-mono text-muted-foreground transition-all duration-500 ${isScrolled ? "mt-0.5 text-[10px]" : "mt-1 text-xs"}`}
            >
              TM
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-12 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group relative text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="#"
              className={`text-foreground/70 transition-all duration-500 hover:text-foreground ${isScrolled ? "text-xs" : "text-sm"}`}
            >
              Sign in
            </a>
            <Button
              size="sm"
              className={`rounded-full bg-foreground text-background transition-all duration-500 hover:bg-foreground/90 ${isScrolled ? "h-8 px-4 text-xs" : "px-6"}`}
            >
              Start creating
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex h-full flex-col px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex flex-1 flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-display text-5xl text-foreground transition-all duration-500 hover:text-muted-foreground ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms",
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div
            className={`flex gap-4 border-t border-foreground/10 pt-8 transition-all duration-500 ${
              isMobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-full text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign in
            </Button>
            <Button
              className="h-14 flex-1 rounded-full bg-foreground text-base text-background"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Start creating
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
