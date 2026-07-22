'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Store, ArrowRight, AlertCircle, Building2 } from 'lucide-react'

export default function PartnerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        throw new Error(loginError.message)
      }

      const user = authData.user

      if (!user) {
        throw new Error('Gagal mengautentikasi pengguna')
      }

      // Verify user is in brand_partner_users
      const { data: partnerRecord } = await supabase
        .from('brand_partner_users')
        .select('id, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (!partnerRecord || !partnerRecord.is_active) {
        await supabase.auth.signOut()
        throw new Error('Akses Ditolak. Akun ini tidak terdaftar sebagai Brand Partner resmi.')
      }

      router.push('/partner')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke Partner Portal')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 border border-white/15 rounded-2xl shadow-xl mb-2 text-blue-300">
            <Store className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/40">
            <Building2 className="w-3 h-3" /> Brand Partner Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AsWeCare Partner Portal</h1>
          <p className="text-xs text-blue-200/80">Kelola pendaftaran proteksi customer &amp; transaksi toko Anda</p>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePartnerLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-blue-100 mb-1.5">Email Login Partner</label>
              <input
                type="email"
                required
                placeholder="partner@toko.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-100 mb-1.5">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi Akun Partner...' : 'Masuk ke Partner Portal'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-center text-blue-300/70">
          Akun partner didaftarkan oleh Administrator AsWeCare.
        </p>
      </div>
    </div>
  )
}
