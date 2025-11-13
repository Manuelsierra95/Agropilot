import { fontSans, fontMono } from '@/utils/fonts'
import '@workspace/ui/globals.css'
import { Providers } from '@/components/providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agropilot - Gestión Inteligente para tu Explotación Agrícola',
  description:
    'Optimiza el manejo de tus parcelas, monitorea eventos en tiempo real, gestiona tus finanzas y toma decisiones basadas en datos con Agropilot.',
  keywords: [
    'gestión agrícola',
    'agricultura',
    'parcelas',
    'gestión de cultivos',
    'software agrícola',
    'agropilot',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
