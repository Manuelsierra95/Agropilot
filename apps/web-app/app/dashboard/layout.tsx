import { fontSans, fontMono } from '@/utils/fonts'

import '@workspace/ui/globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from '@/components/providers'
import { NavBarDock } from '@/components/navbar/NavBarDock'
import { NavBarTop } from '@/components/navbar/NavBarTop'
import { ScrollPaddingWrapper } from '@/components/ScrollPaddingWrapper'
import { getSession } from '@/lib/getSession'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession({ redirectToLogin: true })

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
