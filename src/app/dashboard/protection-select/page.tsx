'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft, CheckCircle2, Zap, Clock, Gift, ShoppingBag, ShieldAlert, ChevronRight, Sparkles } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { cn, formatIDR } from '@/lib/utils'

function ProtectionSelectContent() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')

  const [item, setItem] = useState<any>(null)
  const [membershipTiers, setMembershipTiers] = useState<any[]>([])
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [itemId])

  const fetchData = async () => {
    let itemData: any = null
    if (itemId) {
      const { data, error } = await supabase
        .from('items')
        .select('*, subcategories(name, category_id, coverage_description)')
        .eq('id', itemId)
        .single()

      if (error || !data) {
        setError('Barang tidak ditemukan.')
      } else {
        itemData = data
        setItem(data)
      }
    }

    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('is_active', true)
      .order('duration_months')

    if (tiers && tiers.length > 0) {
      const itemSubcatId = itemData?.subcategory_id
      const itemCatId = itemData?.subcategories?.category_id

      // Filter tiers: specifically matching subcategory OR matching category OR global (both null)
      const matchingTiers = tiers.filter((t) => {
        if (t.subcategory_id && itemSubcatId) return t.subcategory_id === itemSubcatId
        if (t.category_id && itemCatId) return t.category_id === itemCatId
        return !t.subcategory_id && !t.category_id
      })

      const finalTiers = matchingTiers.length > 0 ? matchingTiers : tiers
      setMembershipTiers(finalTiers)
      setSelectedTier(finalTiers[0])
    }

    setLoading(false)
  }

  const formatIndoDecimal = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val)
    if (isNaN(num)) return '0,00'
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleProceedToCheckout = () => {
    if (!selectedTier || !itemId) return
    router.push(`/dashboard/checkout?itemId=${itemId}&tierId=${selectedTier.id}`)
  }

  if (loading) return <div className="py-16 text-center text-xs text-slate-500">Memuat opsi proteksi...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
          Langkah 1 dari 2: Pilih Paket Proteksi
        </span>
      </div>

      {/* Selected Item Summary Card */}
      {item && (
        <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/15">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">Barang yang Akan Dilindungi</span>
                <h2 className="text-xl font-extrabold text-white">{item.brand} {item.model}</h2>
                <p className="text-xs text-slate-300 mt-0.5">Kategori: {item.subcategories?.name || 'Garansi Resmi'}</p>
              </div>
            </div>

            {item.purchase_channel && (
              <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/15 text-xs text-right">
                <span className="text-[10px] text-slate-400 block">Toko Pembelian:</span>
                <span className="font-bold text-indigo-300">{item.purchase_channel}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tier Selection Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pilih Tingkat Proteksi Membership</h2>
          <p className="text-xs text-slate-500 mt-1">Pilih durasi garansi dan fasilitas perbaikan yang sesuai dengan kebutuhan Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {membershipTiers.map((tier, idx) => {
            const isSelected = selectedTier?.id === tier.id
            const waitingDays = tier.waiting_period_days !== undefined ? tier.waiting_period_days : 14

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                onClick={() => setSelectedTier(tier)}
                className="cursor-pointer"
              >
                <Card
                  className={cn(
                    'p-6 space-y-6 flex flex-col justify-between h-full rounded-3xl transition-all duration-300 border',
                    isSelected
                      ? 'border-indigo-600 bg-white ring-2 ring-indigo-600 shadow-xl scale-[1.02]'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-xs'
                  )}
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex justify-between items-center">
                      <span
                        className={cn(
                          'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                          tier.plan_tier === 'basic' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                        )}
                      >
                        {tier.plan_tier}
                      </span>

                      {/* Masa Tenggang Badge */}
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border",
                        waitingDays === 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}>
                        {waitingDays === 0 ? (
                          <>
                            <Zap className="w-3 h-3 text-emerald-600" />
                            0 Hari (Instant)
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Masa Tunggu {waitingDays} Hari
                          </>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">{tier.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Masa Proteksi {tier.duration_months} Bulan {tier.bonus_months > 0 && `+ ${tier.bonus_months} Bln Bonus`}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-slate-100">
                      {tier.original_price > tier.price && (
                        <span className="text-xs text-slate-400 line-through block">{formatIDR(tier.original_price)}</span>
                      )}
                      <div className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                        {formatIDR(tier.price)}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>{2 + (tier.bonus_quota || 0)}x Kuota Klaim</strong> Perbaikan/Tahun</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>$0 Deductible Fee</strong> (Jasa &amp; Sparepart)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Mitra Servis Resmi Terverifikasi</span>
                      </div>
                      {tier.discount_percentage > 0 && (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Hemat {formatIndoDecimal(tier.discount_percentage)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Radio Selection Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      className={cn(
                        'w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2',
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      )}
                    >
                      {isSelected ? '✓ Paket Dipilih' : 'Pilih Paket Ini'}
                    </button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs text-slate-500 block">Paket Dipilih:</span>
          <span className="text-base font-extrabold text-slate-900">
            {selectedTier?.name || 'Pilih Paket'} &bull; <strong className="text-indigo-600">{formatIDR(selectedTier?.price || 0)}</strong>
          </span>
        </div>

        <button
          onClick={handleProceedToCheckout}
          disabled={!selectedTier}
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
        >
          <span>Lanjut ke Pembayaran (QRIS BI 0,7%)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ProtectionSelectPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-slate-500">Memuat halaman proteksi...</div>}>
      <ProtectionSelectContent />
    </Suspense>
  )
}
