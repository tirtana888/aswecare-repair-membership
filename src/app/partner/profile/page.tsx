'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Mail, Phone, MapPin, Tag, Shield, Key, Save, CheckCircle2 } from 'lucide-react'

export default function PartnerProfilePage() {
  const supabase = createClient()
  const [partner, setPartner] = useState<any>(null)
  const [partnerUser, setPartnerUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: pu } = await supabase
      .from('brand_partner_users')
      .select('*, brand_partners(*)')
      .eq('id', user.id)
      .maybeSingle()

    if (pu) {
      setPartnerUser(pu)
      setPartner(pu.brand_partners)
    }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Password tidak cocok')
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-400">Memuat profil...</p>
      </div>
    )
  }

  const infoItems = [
    { icon: Building2, label: 'Nama Bisnis', value: partner?.name },
    { icon: Mail, label: 'Email Kontak', value: partner?.contact_email },
    { icon: Phone, label: 'Telepon', value: partner?.contact_phone },
    { icon: MapPin, label: 'Alamat', value: partner?.address },
    { icon: Tag, label: 'Fokus Kategori', value: partner?.category_focus === 'all' ? 'Semua Kategori' : partner?.category_focus },
    { icon: Shield, label: 'Status', value: partner?.is_active ? 'Aktif' : 'Nonaktif' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Partner</h1>
        <p className="text-sm text-slate-500 mt-1">Informasi bisnis dan pengaturan akun</p>
      </div>

      {/* Business Info */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Informasi Bisnis</h2>
        </div>
        <div className="p-6 space-y-4">
          {infoItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900">{item.value || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Informasi Akun</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Nama Pengguna</p>
              <p className="text-sm font-semibold text-slate-900">{partnerUser?.full_name || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Tag className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Role</p>
              <p className="text-sm font-semibold text-slate-900 capitalize">{partnerUser?.role || 'owner'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Ganti Password
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Password berhasil diubah!
            </div>
          )}
          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {passwordError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </div>
      </div>
    </div>
  )
}
