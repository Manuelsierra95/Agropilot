'use client'

import { useEffect, useState } from 'react'

/**
 * Hook que detecta si la página tiene scroll vertical
 * y retorna si se debe aplicar padding inferior
 */
export function useScrollPadding() {
  const [hasScroll, setHasScroll] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      // Verifica si el contenido desborda verticalmente
      const hasVerticalScroll =
        document.documentElement.scrollHeight > window.innerHeight

      setHasScroll(hasVerticalScroll)
    }

    checkScroll()

    window.addEventListener('resize', checkScroll)

    const observer = new MutationObserver(checkScroll)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      window.removeEventListener('resize', checkScroll)
      observer.disconnect()
    }
  }, [])

  return hasScroll
}
