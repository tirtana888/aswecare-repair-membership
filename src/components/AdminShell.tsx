'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, PackageSearch, ShieldCheck, FolderCog,
  DollarSign, FileText, Handshake, LogOut, Shield, ChevronLeft, ChevronRight,
  ChevronDown, Settings, Store,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const sidebarNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Item Assessment', href: '/admin/items', icon: PackageSearch },
  { label: 'Klaim Servis', href: '/admin/claims', icon: ShieldCheck },
  { label: 'Kategori & Kebijakan', href: '/admin/categories', icon: FolderCog },
  { label: 'Paket & Harga', href: '/admin/pricing', icon: DollarSign },
  { label: 'Ketentuan Produk', href: '/admin/terms', icon: FileText },
  { label: 'Brand Partners', href: '/admin/brand-partners', icon: Store },
  { label: 'Partner Servis', href: '/admin/partners', icon: Handshake },
]

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const initials = (userEmail || 'A')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  const activeLabel = sidebarNav.find((n) => isActive(n.href))?.label || 'Admin'

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[264px]'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block text-slate-900 font-bold text-sm leading-tight tracking-tight">AsWeCare</span>
              <span className="block text-slate-400 text-[10px] font-medium">Admin Console</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Menu</p>
          )}
          {sidebarNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] shrink-0', active && 'text-primary-600')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition text-xs font-medium"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User Section */}
        <div className="border-t border-slate-100 p-3 shrink-0" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                'w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition',
                collapsed && 'justify-center'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 text-left">
                    <span className="block text-xs text-slate-800 font-bold truncate">{userEmail}</span>
                    <span className="text-[10px] text-primary-600 font-bold">Superadmin</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
                </>
              )}
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-dropdown overflow-hidden">
                <div className="px-3.5 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Akun Superadmin</p>
                </div>
                <button
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Pengaturan Akun
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn('flex-1 transition-all duration-300 min-w-0', collapsed ? 'ml-[72px]' : 'ml-[264px]')}>
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Admin</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-primary-50 text-primary-700 font-bold px-2.5 py-1 rounded-full">
              Superadmin
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 max-w-[1400px]">{children}</main>
      </div>
    </div>
  )
}
