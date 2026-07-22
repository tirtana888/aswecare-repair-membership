'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react'
import { Card, Button } from '@/components/ui'

function UpgradeContent() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')

  const [item, setItem] = useState<any>(null)
  const [eligible, setEligible] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (itemId) checkEligibility()
  }, [itemId])

  const checkEligibility = async () => {
    const { data: itemData } = await supabase
      .from('items')
      .select('*, plans(*)')
      .eq('id', itemId)
      .single()

    if (itemData) {
      setItem(itemData)
      const activePlan = itemData.plans && itemData.plans.length > 0 ? itemData.plans[0] : null
      if (!activePlan || activePlan.status !== 'active') {
        setEligible(false)
      }
    }
    setLoading(false)
  }

  if (loading) return <div className="py-16 text-center text-xs text-slate-500">Memeriksa kelayakan upgrade...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>

      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
          <Sparkles className="w-3.5 h-3.5" />
          Extended Plan Upgrade
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Upgrade Proteksi {item?.brand} {item?.model}</h1>
        <p className="text-xs text-slate-500">
          Perpanjang masa proteksi hingga 1 penuh dengan jangkauan perbaikan &amp; prioritas pengerjaan lebih tinggi.
        </p>
      </div>

      {!eligible && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <strong>Syarat Upgrade Belum Terpenuhi:</strong> Barang harus memiliki status plan active tanpa klaim ditolak dalam 3 bulan terakhir.
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 pt-4">
        {/* Basic Plan */}
        <Card className="p-6 space-y-4 opacity-75">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Plan Saat Ini</span>
            <h3 className="text-lg font-bold text-slate-900">Basic Membership</h3>
            <span className="text-xl font-extrabold text-slate-900 block mt-1">Rp 350.000 <span className="text-xs font-normal text-slate-500">/ tahun</span></span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Kuota 2x Servis Perbaikan Per Tahun</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Cakupan Kerusakan Dasar (Jahitan/Sol)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-600 shrink-0" />
              <span>SLA Pengerjaan Standard (5 hari)</span>
            </li>
          </ul>
        </Card>

        {/* Extended Plan */}
        <Card className="p-6 space-y-4 border-2 border-purple-600 shadow-cardHover relative">
          <span className="absolute -top-3 right-4 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Direkomendasikan
          </span>

          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-purple-600 uppercase">Upgrade Ke</span>
            <h3 className="text-lg font-bold text-slate-900">Extended Membership</h3>
            <span className="text-xl font-extrabold text-purple-700 block mt-1">Rp 550.000 <span className="text-xs font-normal text-slate-500">/ tahun</span></span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
              <span><strong>Kuota 4x Servis Perbaikan</strong> Per Tahun</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Prioritas Antrian Pengerjaan Servis</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Cakupan Perbaikan &amp; Deep Cleaning Lengkap</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Gratis Biaya Logistics Pickup &amp; Delivery</span>
            </li>
          </ul>

          <Button
            href={`/dashboard/checkout?itemId=${itemId}&plan=extended`}
            fullWidth
            disabled={!eligible}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Bayar Selisih &amp; Upgrade ke Extended
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-slate-500">Memuat kelayakan upgrade...</div>}>
      <UpgradeContent />
    </Suspense>
  )
}
