'use client'

import React, { useState, useEffect } from 'react'
import { Percent, Wallet, CheckCircle2, Clock, DollarSign, Search } from 'lucide-react'
import { formatIDR } from '@/lib/utils'

interface CommissionRecord {
  id: string
  gross_amount: number
  commission_rate: number
  partner_share: number
  platform_share: number
  payout_status: string
  created_at: string
  members?: { full_name: string; email: string }
  items?: { brand: string; model: string }
}

export default function PartnerCommissionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      const res = await fetch('/api/partner/commissions')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const commissions: CommissionRecord[] = data?.commissions || []
  const filtered = commissions.filter(c =>
    c.members?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.items?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.items?.model?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bagi Hasil &amp; Komisi Partner</h1>
        <p className="text-sm text-slate-500 mt-1">Laporan hak bagi hasil dari polis garansi yang terbayar</p>
      </div>

      {/* Commission Rate Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Persentase Bagi Hasil Aktif Anda</span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-3xl font-extrabold text-white">{data?.activeRate || 10}%</h2>
            <span className="text-xs text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Per Polis Terbayar
            </span>
          </div>
          <p className="text-xs text-blue-200 mt-1">Setiap polis yang terbayar melalui pendaftaran toko Anda otomatis menghasilkan komisi {data?.activeRate || 10}%.</p>
        </div>

        <div className="p-4 bg-white/10 border border-white/15 rounded-xl text-right">
          <p className="text-xs text-blue-200">Saldo Belum Dicairkan</p>
          <p className="text-2xl font-bold text-amber-300">{formatIDR(data?.unpaidBalance || 0)}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Hak Bagi Hasil (Earned)</p>
            <p className="text-2xl font-bold text-slate-900">{formatIDR(data?.totalEarned || 0)}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Komisi Sudah Dicairkan</p>
            <p className="text-2xl font-bold text-emerald-700">{formatIDR(data?.totalPaidOut || 0)}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Menunggu Pencairan</p>
            <p className="text-2xl font-bold text-amber-700">{formatIDR(data?.unpaidBalance || 0)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Rincian Bagi Hasil per Polis</h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari customer atau barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Barang</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Nilai Polis</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">% Rate</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Hak Komisi Partner</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Memuat data komisi...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Belum ada komisi bagi hasil terdaftar</td></tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id} className={`hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.members?.full_name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{c.items?.brand}</div>
                      <div className="text-xs text-slate-500">{c.items?.model}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatIDR(c.gross_amount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        <Percent className="w-3 h-3" />
                        {c.commission_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-700">{formatIDR(c.partner_share)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.payout_status === 'paid_out' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                        {c.payout_status === 'paid_out' ? 'Sudah Dicairkan' : 'Belum Dicairkan'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
