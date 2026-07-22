'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ArrowRight, AlertCircle, ShieldCheck, Users, Star } from 'lucide-react'
import { Button, Input, FormField } from '@/components/ui'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber, email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mendaftarkan akun')
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        setError('Akun berhasil dibuat. Silakan masuk dari halaman Login.')
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
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
            Bergabung dengan ribuan member yang sudah melindungi barang favorit mereka.
          </h2>

          <div className="bg-white/10 rounded-2xl p-5 space-y-3 border border-white/10">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <p className="text-sm text-primary-50 leading-relaxed">
              &ldquo;Klaim sepatu saya diproses cepat, tanpa drama. Sekarang semua sneaker mahal saya sudah terdaftar.&rdquo;
            </p>
            <p className="text-xs text-primary-200 font-semibold">Budi S. — Member sejak 2025</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-semibold">10.000+ Member</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-semibold">Proteksi Terstandarisasi</span>
            </div>
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

          <h1 className="text-2xl font-bold text-slate-900">Buat Akun Member</h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-6">
            Daftar untuk mulai melindungi sepatu dan barang favorit Anda
          </p>

          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <FormField label="Nama Lengkap">
              <Input
                required
                placeholder="Contoh: Budi Santoso"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormField>

            <FormField label="Nomor WhatsApp / HP">
              <Input
                type="tel"
                required
                placeholder="081234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </FormField>

            <FormField label="Email">
              <Input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            <FormField label="Kata Sandi">
              <Input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>

            <Button type="submit" fullWidth loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="mt-2">
              {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
            </Button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-4 leading-tight">
            Dengan mendaftar, Anda menyetujui <a href="#" className="underline">Syarat Layanan</a> dan <a href="#" className="underline">Kebijakan Privasi</a> AsWeCare.
          </p>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-primary-600 hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
