'use client'

import Link from 'next/link'
import { Shield, LogOut, Store, Wrench, FileText, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'
import BrandPartnerModal from '@/components/BrandPartnerModal'
import ServicePartnerModal from '@/components/ServicePartnerModal'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
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

  // Hide Navbar entirely on admin and partner routes — they have their own sidebar shells
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
              <div className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 text-lg leading-tight">AsWeCare</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Repair Membership</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition"
              >
                <Store className="w-4 h-4 text-indigo-500" />
                <span>Join sebagai Brand</span>
              </button>

              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="flex items-center gap-1.5 hover:text-blue-600 transition"
              >
                <Wrench className="w-4 h-4 text-blue-500" />
                <span>Join Partner Servis</span>
              </button>

              <a
                href="#claim-section"
                className="flex items-center gap-1.5 hover:text-slate-900 transition"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Ajukan Klaim</span>
              </a>
            </nav>

            {/* User Auth Buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button variant="secondary" size="sm" icon={<User className="w-4 h-4" />}>
                      Dashboard Saya
                    </Button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title="Keluar Akun"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <BrandPartnerModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} />
      <ServicePartnerModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} />
    </>
  )
}
