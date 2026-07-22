'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, ArrowLeft, QrCode, Gift, ShoppingBag, AlertCircle, CheckCircle2, ShieldCheck, Zap, Percent, Clock } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { cn, formatIDR } from '@/lib/utils'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')
  const tierId = searchParams.get('tierId')

  const [item, setItem] = useState<any>(null)
  const [membershipTiers, setMembershipTiers] = useState<any[]>([])
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [paymentMethod] = useState('qris') // QRIS BI ONLY (0.7% MDR)

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paidSuccess, setPaidSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [itemId, tierId])

  const fetchData = async () => {
    let itemData: any = null
    if (itemId) {
      const { data, error } = await supabase
        .from('items')
        .select('*, subcategories(name, category_id, categories(name))')
        .eq('id', itemId)
        .single()

      if (error || !data) {
        setError('Item tidak ditemukan.')
      } else {
        itemData = data
        setItem(data)
      }
    }

    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('*, categories(name), subcategories(name)')
      .eq('is_active', true)
      .order('duration_months')

    if (tiers && tiers.length > 0) {
      const itemSubcatId = itemData?.subcategory_id
      const itemCatId = itemData?.subcategories?.category_id

      // Filter tiers dynamically matching item subcategory OR category OR global
      const matchingTiers = tiers.filter((t) => {
        if (t.subcategory_id && itemSubcatId) return t.subcategory_id === itemSubcatId
        if (t.category_id && itemCatId) return t.category_id === itemCatId
        return !t.subcategory_id && !t.category_id
      })

      const finalTiers = matchingTiers.length > 0 ? matchingTiers : tiers
      setMembershipTiers(finalTiers)
      const target = tierId ? finalTiers.find((t) => t.id === tierId) : null
      setSelectedTier(target || finalTiers[0])
    }

    setLoading(false)
  }

  const formatIndoDecimal = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val)
    if (isNaN(num)) return '0,00'
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const planPrice = selectedTier ? parseFloat(selectedTier.price) : 120000
  
  // Official Bank Indonesia & ASPI QRIS Standard MDR Rate: 0.7%
  const qrisMdrFee = Math.round(planPrice * 0.007)
  const totalPrice = planPrice + qrisMdrFee

  const handlePayNow = async () => {
    setProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          tierId: selectedTier?.id,
          planTier: selectedTier?.plan_tier || 'basic',
          durationMonths: selectedTier?.duration_months || 3,
          bonusMonths: selectedTier?.bonus_months || 0,
          bonusQuota: selectedTier?.bonus_quota || 0,
          amount: totalPrice,
          qrisFee: qrisMdrFee,
          paymentMethod: 'qris_bi_0.7',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memproses pembayaran QRIS BI')
      }

      setPaidSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setProcessing(false)
    }
  }

  if (loading) return <div className="py-16 text-center text-xs text-slate-500">Memuat halaman checkout...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {paidSuccess && (
        <div className="p-6 bg-emerald-600 text-white rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <span>Pembayaran QRIS BI Lunas Instan!</span>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Pembayaran sebesar <strong>{formatIDR(totalPrice)}</strong> via QRIS Standar Bank Indonesia (MDR 0,7%) berhasil dikonfirmasi. Polis membership <strong>{selectedTier?.name}</strong> kini telah aktif.
          </p>
          <p className="text-[11px] text-emerald-200">Mengarahkan kembali ke Dashboard...</p>
        </div>
      )}

      <Card className="grid md:grid-cols-2 gap-8 p-6 sm:p-8 border border-slate-200/80 rounded-3xl shadow-lg">
        {/* Kolom Kiri: Ringkasan Pesanan & Pilihan Paket */}
        <div className="space-y-6 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Checkout Membership</span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">Proteksi Garansi Resmi</h1>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Barang Terproteksi:</span>
              <span className="font-bold text-slate-900">{item?.brand} {item?.model}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Kategori &amp; Subkategori:</span>
              <span className="font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {item?.subcategories?.categories?.name ? `${item.subcategories.categories.name} • ${item.subcategories.name}` : item?.subcategories?.name || 'Kategori'}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-500 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                Toko Pembelian:
              </span>
              <span className="font-bold text-indigo-700">{item?.purchase_channel || 'Toko Resmi / Direct'}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-900">Pilih Durasi &amp; Paket Membership:</label>
            <div className="space-y-2">
              {membershipTiers.map((tier) => {
                const isSelected = selectedTier?.id === tier.id
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      'p-3.5 rounded-2xl border cursor-pointer transition space-y-1',
                      isSelected ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="membershipTier" checked={isSelected} onChange={() => setSelectedTier(tier)} className="text-indigo-600 focus:ring-indigo-500" />
                        <span className="font-bold text-xs text-slate-900">{tier.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">{formatIDR(tier.price)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-6 text-[10px]">
                      {/* Masa Tenggang Badge */}
                      <span className={cn(
                        "font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border",
                        (tier.waiting_period_days || 14) === 0
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      )}>
                        {(tier.waiting_period_days || 14) === 0 ? (
                          <>
                            <Zap className="w-3 h-3 text-emerald-600" />
                            Tanpa Masa Tunggu (0 Hari)
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Masa Tenggang {tier.waiting_period_days || 14} Hari
                          </>
                        )}
                      </span>

                      {tier.bonus_months > 0 && (
                        <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Gift className="w-3 h-3 text-purple-600" />
                          Bonus +{tier.bonus_months} Bulan
                        </span>
                      )}
                      {tier.discount_percentage > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Diskon {formatIndoDecimal(tier.discount_percentage)}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Harga Paket ({selectedTier?.name})</span>
              <span>{formatIDR(planPrice)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <span>Biaya Transaksi QRIS BI (0.7%)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Resmi BI</span>
              </span>
              <span>{formatIDR(qrisMdrFee)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Pembayaran</span>
              <span className="text-indigo-600">{formatIDR(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: QRIS STANDAR BANK INDONESIA (0.7% MDR) */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Standar Resmi Bank Indonesia &amp; ASPI
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">QRIS BI (MDR 0,7%)</h2>
                <p className="text-xs text-slate-500">Bukan biaya flat Rp 4.000. Hemat &amp; sesuai regulasi pemerintah.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* QRIS Display Box */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-4 shadow-inner">
              <div className="inline-flex items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-900 block">QRIS - Quick Response Code Indonesian Standard</span>
                <p className="text-[11px] text-slate-500">MDR Resmi Pemerintah: 0,7% per transaksi (Bukan Rp 4.000)</p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2 pt-2 border-t border-slate-200/80 text-[10px] font-extrabold text-slate-600">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">GOPAY</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">OVO</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">DANA</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">SHOPEEPAY</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">BCA</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">LIVIN</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              size="lg"
              variant="primary"
              loading={processing}
              disabled={paidSuccess}
              onClick={handlePayNow}
              icon={<Zap className="w-4 h-4" />}
            >
              {processing ? 'Memproses QRIS BI Auto-Paid...' : `Bayar ${formatIDR(totalPrice)} (QRIS BI Auto-Paid)`}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Standar QRIS Bank Indonesia &bull; MDR 0,7% Verified</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-xs text-slate-500">Memuat halaman checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
