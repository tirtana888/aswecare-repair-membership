'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Receipt, Search, Calendar, TrendingUp } from 'lucide-react'

interface Transaction {
  id: string
  customer_name: string
  brand: string
  model: string
  plan_tier: string
  amount: number
  status: string
  created_at: string
  payment_mode: string
}

export default function TransactionsPage() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: partnerUser } = await supabase
        .from('brand_partner_users')
        .select('brand_partner_id')
        .eq('id', user.id)
        .maybeSingle()

      if (!partnerUser) return

      const { data: items } = await supabase
        .from('items')
        .select(`
          id, brand, model, created_at,
          members ( full_name ),
          plans ( plan_tier, status, xendit_invoice_id )
        `)
        .eq('registered_by_partner_id', partnerUser.brand_partner_id)
        .order('created_at', { ascending: false })

      if (items) {
        setTransactions(items.map((item: any) => ({
          id: item.id,
          customer_name: item.members?.full_name || '-',
          brand: item.brand,
          model: item.model,
          plan_tier: item.plans?.[0]?.plan_tier || '-',
          amount: 0,
          status: item.plans?.[0]?.status || 'pending',
          created_at: item.created_at,
          payment_mode: item.plans?.[0]?.xendit_invoice_id?.startsWith('inv_partner_') ? 'Partner' : 'Customer',
        })))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter(t =>
    t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
      expired: 'bg-slate-100 text-slate-600 border-slate-200',
    }
    const labels: Record<string, string> = {
      active: 'Aktif',
      pending_payment: 'Menunggu Bayar',
      expired: 'Kedaluwarsa',
      pending: 'Menunggu',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
        <p className="text-sm text-slate-500 mt-1">Semua pendaftaran customer dan status proteksi</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Transaksi</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Proteksi Aktif</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.filter(t => t.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Menunggu Bayar</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.filter(t => t.status === 'pending_payment').length}</p>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari customer, merk, atau model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Barang</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Paket</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Dibayar Oleh</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Belum ada transaksi</td></tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={t.id} className={`hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-3 font-medium text-slate-900">{t.customer_name}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{t.brand}</div>
                      <div className="text-xs text-slate-500">{t.model}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-slate-700">{t.plan_tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${t.payment_mode === 'Partner' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {t.payment_mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
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
