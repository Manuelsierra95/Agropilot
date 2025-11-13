'use client'

import { useScrollPadding } from '@/hooks/useScrollPadding'

interface ScrollPaddingWrapperProps {
  children: React.ReactNode
}

/**
 * Componente que agrega padding inferior cuando la página tiene scroll
 * para dejar espacio al NavBarDock
 */
export function ScrollPaddingWrapper({ children }: ScrollPaddingWrapperProps) {
  const hasScroll = useScrollPadding()

  return (
    <div
      className={`transition-[padding] duration-300 ${
        hasScroll ? 'pb-24' : 'pb-0'
      }`}
    >
      {children}
    </div>
  )
}
