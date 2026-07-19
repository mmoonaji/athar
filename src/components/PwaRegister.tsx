'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

/**
 * Client Component: Registers the PWA service worker on mounting
 * and catches the native browser install prompt to display a custom RTL banner.
 */
export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // 1. Service worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service worker registration failed:', err)
        })
      })
    }

    // 2. Catch native browser install trigger
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Don't show if user has already dismissed it in this session
      const dismissed = sessionStorage.getItem('athar_install_dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    // 3. Watch for successful installation
    const handleAppInstalled = () => {
      trackEvent('pwa_installed')
      setShowBanner(false)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    setShowBanner(false)
    await deferredPrompt.prompt()
    
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      trackEvent('pwa_installed')
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    sessionStorage.setItem('athar_install_dismissed', 'true')
  }

  if (!showBanner || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:right-auto md:left-4 md:w-80 bg-primary-950 text-white p-4 rounded-xl shadow-lg border border-primary-800 z-50 flex items-start gap-3 animate-bounce-short text-start">
      <div className="h-10 w-10 bg-primary-800 rounded-lg flex items-center justify-center shrink-0">
        <Download className="w-5 h-5 text-secondary-400" />
      </div>

      <div className="flex-1">
        <h4 className="text-xs font-bold text-secondary-400 mb-0.5">تثبيت تطبيق أثر</h4>
        <p className="text-[11px] text-primary-200 leading-relaxed mb-2">
          ثبّت التطبيق على شاشتك الرئيسية للوصول السريع ومواصلة التعلم دون اتصال بالإنترنت.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-secondary-500 hover:bg-secondary-600 text-secondary-foreground font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors"
          >
            تثبيت الآن
          </button>
          <button
            onClick={handleDismiss}
            className="text-primary-300 hover:text-white font-bold text-[10px] px-2 py-1.5"
          >
            لاحقاً
          </button>
        </div>
      </div>

      <button 
        onClick={handleDismiss} 
        className="text-primary-400 hover:text-white shrink-0 mt-0.5"
        aria-label="إغلاق التنبيه"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
