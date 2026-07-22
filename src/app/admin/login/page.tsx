'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, AlertCircle, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        throw new Error(loginError.message)
      }

      const user = authData.user
      const isSuperAdmin = user?.email?.toLowerCase() === 'superclaim@globalbeli.com'

      let isAdmin = isSuperAdmin
      if (!isAdmin && user) {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()
        isAdmin = !!adminRecord
      }

      if (!isAdmin) {
        await supabase.auth.signOut()
        throw new Error('Akses Ditolak. Akun ini tidak memiliki hak akses Admin.')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke Admin Console')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl mb-2 text-blue-400">
            <Shield className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/50">
            <Lock className="w-3 h-3" /> Enterprise Admin Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">AsWeCare Admin Console</h1>
          <p className="text-xs text-slate-400">Masuk untuk mengelola operasional, sistem, dan data platform</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Admin</label>
              <input
                type="email"
                required
                placeholder="admin@aswecare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi Admin</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi Hak Akses...' : 'Masuk ke Admin Console'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-center text-slate-500">
          Halaman ini khusus untuk pengelola sistem AsWeCare.
        </p>
      </div>
    </div>
  )
}
