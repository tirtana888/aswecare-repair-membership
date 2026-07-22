'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ArrowRight, AlertCircle, ShieldCheck, Clock, Wrench } from 'lucide-react'
import { Button, Input, FormField } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
    } else {
      const loggedUser = authData.user
      const isSuperAdmin = loggedUser?.email?.toLowerCase() === 'superclaim@globalbeli.com'
      
      let isAdmin = isSuperAdmin
      if (!isAdmin && loggedUser) {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', loggedUser.id)
          .maybeSingle()
        isAdmin = !!adminRecord
      }

      let isPartner = false
      if (!isAdmin && loggedUser) {
        const { data: partnerRecord } = await supabase
          .from('brand_partner_users')
          .select('id')
          .eq('id', loggedUser.id)
          .eq('is_active', true)
          .maybeSingle()
        isPartner = !!partnerRecord
      }

      if (isAdmin) {
        router.push('/admin')
      } else if (isPartner) {
        router.push('/partner')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg">AsWeCare</span>
        </Link>

        <div className="space-y-8 max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
            Proteksi barang premium Anda, dikelola dari satu dashboard.
          </h2>
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: 'Garansi terstandarisasi untuk sneaker dan gadget favorit' },
              { icon: Clock, text: 'Klaim servis diproses dengan SLA 1x24 jam' },
              { icon: Wrench, text: 'Ditangani jaringan mitra reparasi terverifikasi' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-primary-50 leading-relaxed pt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-200">&copy; 2026 AsWeCare. Repair Membership Platform.</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Masuk ke Akun Anda</h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-7">
            Kelola barang terdaftar dan pengajuan klaim Anda
          </p>

          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField label="Email">
              <Input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                <a href="#" className="text-[11px] text-primary-600 hover:underline font-medium">Lupa kata sandi?</a>
              </div>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" fullWidth loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="mt-2">
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-slate-100 space-y-3 text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?{' '}
              <Link href="/signup" className="font-semibold text-primary-600 hover:underline">
                Daftar sekarang
              </Link>
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-50">
              <Link href="/partner/login" className="hover:text-primary-600 font-medium">
                Portal Brand Partner &rarr;
              </Link>
              <span>&bull;</span>
              <Link href="/admin/login" className="hover:text-primary-600 font-medium">
                Admin Console &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
