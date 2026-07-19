'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, Compass, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Client Component: Global Application Layout Shell.
 * Renders a fixed Bottom Tab Navigation bar on mobile viewports
 * and a side navigation drawer on desktop screens.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  // Define navigation tabs
  const tabs = [
    {
      label: 'الرئيسية',
      href: '/',
      icon: Home,
    },
    {
      label: 'التعلم',
      href: '/learn',
      icon: Compass,
    },
    {
      label: 'رحلتي',
      href: '/journey',
      icon: BookOpen,
    },
    {
      label: 'المحفوظات',
      href: '/bookmarks',
      icon: Bookmark,
    },
    {
      label: 'الحساب',
      href: '/profile',
      icon: User,
    },
  ]

  // Hide bottom nav in auth screens or lesson screens to maximize viewport space
  const isAuthOrLesson = pathname.startsWith('/login') || 
                         pathname.startsWith('/signup') || 
                         pathname.startsWith('/lesson')

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-background text-foreground">
      {/* 1. Desktop Sidebar Navigation (Right-side in RTL layout) */}
      {!isAuthOrLesson && (
        <aside className="hidden md:flex md:w-64 border-l border-border bg-card flex-col py-6 px-4 shrink-0 text-start">
          <div className="flex items-center gap-3 mb-8 px-2">
            <span className="h-9 w-9 rounded-lg bg-primary-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
              أ
            </span>
            <div>
              <span className="text-xl font-extrabold text-primary-700 block leading-none">أثَــر</span>
              <span className="text-[10px] text-muted-foreground mt-1 block">بناء الأثر المعرفي</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
              const Icon = tab.icon

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
      )}

      {/* 2. Main Page Render Area */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          {children}
        </main>

        {/* 3. Mobile Bottom Navigation Bar (Hidden on desktop) */}
        {!isAuthOrLesson && (
          <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-md border-t border-border z-40 pb-[env(safe-area-inset-bottom)] shadow-lg">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
                const Icon = tab.icon

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-all gap-1 active:scale-95',
                      isActive ? 'text-primary-700 font-bold' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] tracking-wide">{tab.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
