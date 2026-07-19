'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Client Component: Global application level Error Boundary.
 * Displays error alerts in Arabic RTL with retry actions.
 */
export default function Error({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error details to diagnostic console logs
    console.error('Unhandled app boundary error:', error)
  }, [error])

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen justify-center items-center text-center">
      <div className="bg-card border border-border p-6 rounded-2xl w-full shadow-sm flex flex-col items-center">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h2 className="text-lg font-extrabold text-primary-950 mb-2">عذراً، حدث خطأ غير متوقع</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xs">
          نواجه مشكلة في تحميل هذه الصفحة حالياً. يرجى المحاولة مرة أخرى أو العودة لاحقاً.
        </p>

        <button
          onClick={() => reset()}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة تحميل الصفحة</span>
        </button>
      </div>
    </div>
  )
}
