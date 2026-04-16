import Link from "next/link"

export interface LegalSection {
  title: string
  paragraphs: string[]
  items?: string[]
}

interface LegalDocumentProps {
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
}

export function LegalDocument({
  title,
  description,
  lastUpdated,
  sections,
}: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-14">
      <article className="mx-auto w-full max-w-4xl space-y-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        <header className="space-y-4 border-b pb-6">
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <Link
              href="/"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Volver a inicio
            </Link>
            <p>Ultima actualizacion: {lastUpdated}</p>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                {section.title}
              </h2>

              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {section.items ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
