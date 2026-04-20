import UserAuthForm from "./components/user-auth-form"
import { RippleBackground } from "../../components/ripple-background"

export default function SignInViewPage() {
  const company = "Agropilot"
  const logo = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  )

  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-background lg:grid-cols-2">
      {/* Left Section - Brand & Grid */}
      <section className="relative hidden min-h-[40vh] flex-col border-b border-border/40 bg-muted/20 p-8 sm:p-10 lg:flex lg:min-h-screen lg:border-r lg:border-b-0">
        <RippleBackground
          className="absolute inset-0 z-10 [--ripple-color:var(--primary-foreground)] dark:[--ripple-color:var(--secondary-foreground)]"
          color="var(--ripple-color)"
          mainCircleOpacity={0.32}
          company={company}
          logo={logo}
        />

        {/* Tagline */}
        <div className="relative z-20 mt-auto space-y-3">
          <h1 className="max-w-4xl text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground">
            Agricultura de precisión con decisiones guiadas por datos.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Monitorea parcelas, previsiones y rendimiento desde un mismo panel.
          </p>
        </div>
      </section>

      {/* Right Section - Auth Form */}
      <section className="mx-auto flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <UserAuthForm
          title="Inicia sesión"
          subtitle="Accede a Agropilot con tu cuenta de Google o GitHub."
          company={company}
          logo={logo}
        />
      </section>
    </div>
  )
}
