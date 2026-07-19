'use client'

import { useEffect, useState } from 'react'

/**
 * Custom React Hook to observe and fetch the current active document direction (RTL vs LTR).
 * Automatically updates component state if direction attribute changes on the root HTML.
 */
export function useLocale() {
  const [dir, setDir] = useState<'rtl' | 'ltr'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('dir') === 'ltr' ? 'ltr' : 'rtl'
    }
    return 'rtl'
  })

  useEffect(() => {
    const html = document.documentElement
    const observer = new MutationObserver(() => {
      setDir(html.getAttribute('dir') === 'ltr' ? 'ltr' : 'rtl')
    })
    
    observer.observe(html, { attributes: true, attributeFilter: ['dir'] })

    return () => observer.disconnect()
  }, [])

  const isRtl = dir === 'rtl'

  return {
    dir,
    isRtl,
    isLtr: !isRtl,
  }
}
