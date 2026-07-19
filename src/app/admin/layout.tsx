import { ReactNode } from 'react'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import { Bell, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans" dir="rtl">
      {/* Persistent Sidebar */}
      <AdminSidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ps-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          {/* Breadcrumbs Indicator */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/admin" className="hover:text-teal-600 transition-colors">
              لوحة التحكم
            </Link>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-800">المشرفين</span>
          </div>

          {/* User Controls Panel */}
          <div className="flex items-center gap-4">
            {/* Notification bell icon */}
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown Drawer */}
            <div className="flex items-center gap-3 border-s border-slate-200 ps-4">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-sm">
                م
              </div>
              <div className="hidden md:block text-start">
                <p className="text-xs font-semibold text-slate-800">مشرف المحتوى</p>
                <p className="text-[10px] text-slate-400">مسؤول النظام</p>
              </div>
            </div>

            {/* Public App link */}
            <Link
              href="/journey"
              className="text-xs font-semibold text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition-all"
            >
              الذهاب للتطبيق
            </Link>
          </div>
        </header>

        {/* Dynamic Page Slots */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
