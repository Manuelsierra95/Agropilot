'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px)').matches

  const position = isMobile ? 'top-left' : 'bottom-left'

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
      <Toaster position={position} richColors />
    </NextThemesProvider>
  )
}
