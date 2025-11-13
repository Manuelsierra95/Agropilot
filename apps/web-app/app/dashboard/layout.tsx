'use client'

import { fontSans, fontMono } from '@/utils/fonts'

import '@workspace/ui/globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from '@/components/providers'
import { NavBarDock } from '@/components/navbar/NavBarDock'
import { NavBarTop } from '@/components/navbar/NavBarTop'
import { ScrollPaddingWrapper } from '@/components/ScrollPaddingWrapper'
import { useSession } from '@/hooks/useSession'
import { SessionLoader } from '@/components/loaders/SessionLoader'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isAuthenticated, loading } = useSession({ requireAuth: true })

  if (loading) return <SessionLoader />
  if (!isAuthenticated) return null

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <NavBarTop />
        <ScrollPaddingWrapper>
          <Providers>{children}</Providers>
        </ScrollPaddingWrapper>
        <NavBarDock />
      </body>
    </html>
  )
}
