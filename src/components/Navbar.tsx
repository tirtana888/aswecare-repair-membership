'use client'

import Link from 'next/link'
import { Shield, LogOut, Store, Wrench, FileText, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'
import BrandPartnerModal from '@/components/BrandPartnerModal'
import ServicePartnerModal from '@/components/ServicePartnerModal'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)

  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [supabase])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/partner')) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 border-b ${
          scrolled ? 'bg-white/90 backdrop-blur-md border-slate-200/80 shadow-xs' : 'bg-white border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 text-lg leading-tight">AsWeCare</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Repair Membership</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition py-2"
              >
                <Store className="w-4 h-4 text-indigo-500" />
                <span>Join sebagai Brand</span>
              </button>

              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-blue-600 transition py-2"
              >
                <Wrench className="w-4 h-4 text-blue-500" />
                <span>Join Partner Servis</span>
              </button>

              <a
                href="#claim-section"
                className="flex items-center gap-1.5 hover:text-slate-900 transition py-2"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Ajukan Klaim</span>
              </a>
            </nav>

            {/* Right Actions & Mobile Hamburger */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button variant="secondary" size="sm" icon={<User className="w-4 h-4" />}>
                      Dashboard Saya
                    </Button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50 transition"
                    title="Keluar Akun"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Daftar Proteksi
                    </Button>
                  </Link>
                </div>
              )}

              {/* Hamburger Button for Mobile & Tablet */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIsBrandModalOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition"
              >
                <Store className="w-5 h-5 text-indigo-600" />
                <span>Join sebagai Brand Partner</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIsServiceModalOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
              >
                <Wrench className="w-5 h-5 text-blue-600" />
                <span>Join Partner Servis Resmi</span>
              </button>

              <a
                href="#claim-section"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition"
              >
                <FileText className="w-5 h-5 text-slate-500" />
                <span>Ajukan Klaim Servis</span>
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 text-center bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Dashboard Saya
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2.5 text-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    Keluar Akun
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-center border border-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-50"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-center bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Daftar Proteksi
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <BrandPartnerModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} />
      <ServicePartnerModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} />
    </>
  )
}
