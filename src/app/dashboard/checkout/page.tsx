'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, ArrowLeft, QrCode, CreditCard, Building2, Gift, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { cn, formatIDR } from '@/lib/utils'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')

  const [item, setItem] = useState<any>(null)
  const [membershipTiers, setMembershipTiers] = useState<any[]>([])
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('qris')

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paidSuccess, setPaidSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [itemId])

  const fetchData = async () => {
    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('is_active', true)
      .order('duration_months')

    if (tiers && tiers.length > 0) {
      setMembershipTiers(tiers)
      setSelectedTier(tiers[0])
    }

    if (itemId) {
      const { data, error } = await supabase
        .from('items')
        .select('*, subcategories(name)')
        .eq('id', itemId)
        .single()

      if (error || !data) {
        setError('Item tidak ditemukan.')
      } else {
        setItem(data)
      }
    }
    setLoading(false)
  }

  const formatIndoDecimal = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val)
    if (isNaN(num)) return '0,00'
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const planPrice = selectedTier ? parseFloat(selectedTier.price) : 120000
  const adminFee = selectedTier ? parseFloat(selectedTier.admin_fee) : 5000
  const totalPrice = planPrice + adminFee

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
          paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memproses pembayaran')
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
        <div className="p-6 bg-emerald-600 text-white rounded-card shadow-lg space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <span>Pembayaran Lunas Otomatis! (Auto-Paid Instant)</span>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Pembayaran sebesar <strong>{formatIDR(totalPrice)}</strong> via {paymentMethod.toUpperCase()} berhasil dikonfirmasi secara instan. Garansi membership <strong>{selectedTier?.name}</strong> telah aktif.
          </p>
          <p className="text-[11px] text-emerald-200">Mengarahkan Anda kembali ke Dashboard Barang Saya...</p>
        </div>
      )}

      <Card className="grid md:grid-cols-2 gap-8 p-6 sm:p-8">
        {/* Kolom Kiri: Ringkasan Pesanan & Pilihan Paket */}
        <div className="space-y-6 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ringkasan Pembayaran</span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Pembelian Membership Proteksi</h1>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Barang Terproteksi:</span>
              <span className="font-bold text-slate-900">{item?.brand} {item?.model}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Kategori:</span>
              <span className="font-semibold text-slate-800">{item?.subcategories?.name}</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-600 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-primary-600" />
                Toko Pembelian:
              </span>
              <span className="font-bold text-primary-800">{item?.purchase_channel || 'Toko Resmi / Direct'}</span>
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
                      'p-3.5 rounded-xl border cursor-pointer transition space-y-1',
                      isSelected ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600' : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <input type="radio" name="membershipTier" checked={isSelected} onChange={() => setSelectedTier(tier)} className="text-primary-600 focus:ring-primary-500" />
                        <span className="font-bold text-xs text-slate-900">{tier.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">{formatIDR(tier.price)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-6 text-[10px]">
                      {tier.bonus_months > 0 && (
                        <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Gift className="w-3 h-3 text-purple-600" />
                          Bonus +{tier.bonus_months} Bulan
                        </span>
                      )}
                      {tier.discount_percentage > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
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
            <div className="flex justify-between text-slate-600">
              <span>Biaya Penanganan / Admin</span>
              <span>{formatIDR(adminFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Pembayaran</span>
              <span className="text-primary-700">{formatIDR(totalPrice)}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Catatan Transparansi Layanan
            </div>
            <p className="leading-relaxed text-amber-800">
              Cakupan membership berupa <strong>jasa perbaikan &amp; perawatan fisik</strong>, bukan penggantian uang tunai atau klaim asuransi murni. Masa tunggu klaim berlaku 14 hari sejak pembayaran dikonfirmasi.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Metode Pembayaran & Auto-Paid Action */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pilih Metode Pembayaran</h2>
            <p className="text-xs text-slate-500">Auto-Paid Instant Enabled</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {[
              { value: 'qris', icon: QrCode, title: 'QRIS Instant Auto-Paid', desc: 'Konfirmasi pembayaran otomatis seketika', tag: 'Rekomendasi' },
              { value: 'va', icon: Building2, title: 'Virtual Account Bank', desc: 'BCA, Mandiri, BNI, BRI, Permata' },
              { value: 'card', icon: CreditCard, title: 'Kartu Kredit / Debit', desc: 'Visa & Mastercard' },
            ].map((method) => (
              <label
                key={method.value}
                className={cn(
                  'p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition',
                  paymentMethod === method.value ? 'border-primary-600 bg-primary-50/40 ring-1 ring-primary-600' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <method.icon className="w-5 h-5 text-slate-700" />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{method.title}</span>
                      <span className="text-[10px] text-slate-500">{method.desc}</span>
                    </div>
                  </div>
                </div>
                {method.tag && <span className="text-[10px] bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded">{method.tag}</span>}
              </label>
            ))}
          </div>

          <Button
            fullWidth
            size="lg"
            variant="secondary"
            loading={processing}
            disabled={paidSuccess}
            onClick={handlePayNow}
          >
            {processing ? 'Memproses Auto-Paid...' : `Bayar ${formatIDR(totalPrice)} (Auto-Paid)`}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-primary-600" />
            <span>Auto-Paid Instant Enabled - Xendit Gateway</span>
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
