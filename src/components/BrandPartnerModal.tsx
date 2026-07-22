'use client'

import React, { useState } from 'react'
import { Store, X, CheckCircle2, AlertCircle, Send } from 'lucide-react'

interface BrandPartnerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BrandPartnerModal({ isOpen, onClose }: BrandPartnerModalProps) {
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('Electronic')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/lead-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'brand',
          name,
          contactName,
          email,
          phone,
          category,
          address,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim pendaftaran')

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setName('')
    setContactName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setSuccess(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Join sebagai Brand Partner</h3>
              <p className="text-xs text-slate-500">Integrasikan proteksi AsWeCare ke toko &amp; produk Anda</p>
            </div>
          </div>
          <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Pendaftaran Berhasil Dikirim!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Tim Partnership AsWeCare akan menghubungi Anda via WhatsApp/Email dalam 1x24 jam kerja.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition"
              >
                Selesai
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Brand / Toko *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sneakerhead Jakarta / Toko Gadget"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pengelola *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Penanggung Jawab"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fokus Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Electronic">Electronic &amp; Gadget</option>
                    <option value="Fashion">Fashion &amp; Apparel</option>
                    <option value="Semua">Semua Kategori</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Bisnis *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@toko.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telepon *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Toko / Kota</label>
                <input
                  type="text"
                  placeholder="Contoh: Mall Senayan City, Jakarta Pusat"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Brand Partner'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
