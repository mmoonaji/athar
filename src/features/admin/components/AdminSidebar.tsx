'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GitBranch,
  BookOpen,
  FileSpreadsheet,
  ClipboardCheck,
  Image,
  Settings,
  Sparkles,
  BarChart2,
} from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'الإحصائيات', icon: BarChart2 },
    { href: '/admin/curriculum', label: 'شجرة المناهج', icon: GitBranch },
    { href: '/admin/lessons', label: 'إدارة الدروس', icon: BookOpen },
    { href: '/admin/specifications', label: 'مواصفات الدروس', icon: FileSpreadsheet },
    { href: '/admin/reviews', label: 'المراجعة والتدقيق', icon: ClipboardCheck },
    { href: '/admin/media', label: 'مكتبة الوسائط', icon: Image },
    { href: '/admin/settings', label: 'إعدادات المنصة', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 start-0 border-e border-slate-800 z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-teal-400 text-lg">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>لوحة أثر للمشرفين</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        <span>نسخة المشرفين v1.0.0</span>
      </div>
    </aside>
  )
}
