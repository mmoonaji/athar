'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { LogOut, RefreshCw } from 'lucide-react'

/**
 * Client Component: Quick logout trigger utilizing transitions
 * and redirection handlers.
 */
export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      const res = await signOut()
      if (res.success) {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
    >
      {isPending ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>تسجيل الخروج</span>
    </button>
  )
}
