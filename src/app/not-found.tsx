import Link from 'next/link'
import { AlertTriangle, Compass } from 'lucide-react'

/**
 * Custom 404 Route Error Page.
 * Styled in Arabic RTL with support for dynamic catalog redirection.
 */
export default function NotFound() {
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col p-4 max-w-md mx-auto w-full min-h-screen justify-center items-center text-center">
      <div className="bg-card border border-border p-6 rounded-2xl w-full shadow-sm flex flex-col items-center">
        <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-black text-primary-950 mb-1">٤٠٤</h1>
        <h2 className="text-lg font-extrabold text-primary-900 mb-2">الصفحة غير موجودة</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xs">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون قد نُقلت أو حُذفت.
        </p>

        <Link
          href="/learn"
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>العودة لمنهج التعلم</span>
        </Link>
      </div>
    </div>
  )
}
