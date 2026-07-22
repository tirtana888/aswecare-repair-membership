'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Footprints, Smartphone, ShieldAlert, Clock, AlertCircle, CreditCard, ShoppingBag, ArrowUpCircle } from 'lucide-react'
import { PageHeader, Card, Button, StatusBadge, EmptyState, SkeletonCardGrid } from '@/components/ui'
import { formatDateID } from '@/lib/utils'

export default function MemberDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMemberItems()

    // Realtime Sync for instant status updates
    const itemsChannel = supabase
      .channel('member-items-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchMemberItems()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => {
        fetchMemberItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(itemsChannel)
    }
  }, [])

  const fetchMemberItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: itemsData, error: itemsErr } = await supabase
      .from('items')
      .select('*, subcategories(name, category_id)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })

    if (itemsErr || !itemsData) {
      console.error('Error fetching items:', itemsErr)
      setLoading(false)
      return
    }

    const itemIds = itemsData.map((i) => i.id)
    if (itemIds.length > 0) {
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .in('item_id', itemIds)

      const mergedItems = itemsData.map((item) => {
        const itemPlans = (plansData || []).filter((p) => p.item_id === item.id)
        return { ...item, plans: itemPlans }
      })

      setItems(mergedItems)
    } else {
      setItems([])
    }
    setLoading(false)
  }

  const getActivePlan = (item: any) =>
    item.plans && item.plans.length > 0
      ? item.plans.find((p: any) => p.status === 'active') || item.plans[item.plans.length - 1]
      : null

  // Payment-First Status Badge Logic
  const renderStatusBadge = (item: any) => {
    const activePlan = getActivePlan(item)

    if (item.condition_at_signup === 'rejected') {
      return <StatusBadge status="rejected" label="Foto Ditolak (Revisi)" />
    }

    if (!activePlan || activePlan.status === 'pending_payment') {
      return <StatusBadge status="pending_payment" label="Belum Bayar Membership" />
    }

    const isWaitingPeriod = activePlan.waiting_period_end_date && new Date(activePlan.waiting_period_end_date) > new Date()
    if (isWaitingPeriod) {
      return <StatusBadge status="waiting_period" />
    }

    if (activePlan.plan_tier === 'extended') {
      return <StatusBadge status="extended" />
    }

    return <StatusBadge status="active" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Barang Saya"
        description="Kelola barang terdaftar, bayar membership, dan ajukan klaim perbaikan."
        action={
          <Button href="/dashboard/items/new" icon={<Plus className="w-4 h-4" />}>
            Tambah Barang
          </Button>
        }
      />

      {loading ? (
        <SkeletonCardGrid count={3} />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Footprints className="w-6 h-6" />}
            title="Belum Ada Barang Terdaftar"
            description="Daftarkan sepatu sneaker atau aksesori gadget favorit Anda untuk mulai menikmati proteksi perawatan."
            action={
              <Button href="/dashboard/items/new" size="sm" icon={<Plus className="w-4 h-4" />}>
                Daftarkan Barang Pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const activePlan = getActivePlan(item)
            const isWaitingPeriod = activePlan?.waiting_period_end_date && new Date(activePlan.waiting_period_end_date) > new Date()
            const isClaimDisabled = !activePlan || activePlan.status !== 'active' || isWaitingPeriod

            return (
              <Card key={item.id} hover className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                      {item.subcategories?.name?.toLowerCase().includes('sneaker') ? (
                        <Footprints className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.brand} {item.model}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {item.subcategories?.name || 'Kategori'}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(item)}
                </div>

                <div className="border-t border-b border-slate-100 py-3 text-xs space-y-1.5">
                  {item.purchase_channel && (
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Toko Pembelian:
                      </span>
                      <span className="font-bold text-primary-700">{item.purchase_channel}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Sisa Kuota Tahun Ini:</span>
                    <span className="font-bold text-slate-900">
                      {activePlan ? `${activePlan.annual_quota - activePlan.quota_used}/${activePlan.annual_quota} Klaim` : 'Belum Aktif'}
                    </span>
                  </div>
                  {activePlan?.plan_end_date && (
                    <div className="flex justify-between text-slate-600">
                      <span>Masa Berlaku Plan:</span>
                      <span className="font-medium text-slate-800">{formatDateID(activePlan.plan_end_date)}</span>
                    </div>
                  )}
                </div>

                {/* Guidance Banner for Payment First Funnel */}
                {(!activePlan || activePlan.status !== 'active') && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-xl space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      Bayar Membership untuk Mengaktifkan Proteksi
                    </div>
                    <p className="text-amber-800">
                      Selesaikan pembayaran untuk mengaktifkan garansi 14 hari masa tunggu. Assessment foto akan berjalan paralel oleh Admin.
                    </p>
                  </div>
                )}

                {activePlan && activePlan.status === 'active' && item.condition_at_signup === 'pending_review' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] rounded-xl space-y-1">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Pembayaran Lunas &amp; Foto Dalam Peninjauan Admin
                    </div>
                    <p className="text-slate-500">
                      Garansi aktif! Foto barang sedang dinilai oleh Admin (SLA 1x24 jam).
                    </p>
                  </div>
                )}

                {isWaitingPeriod && activePlan?.waiting_period_end_date && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-lg flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    Bisa klaim mulai <strong>{formatDateID(activePlan.waiting_period_end_date)}</strong> (Masa tunggu 14 hari)
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  {!activePlan || activePlan.status !== 'active' ? (
                    <Button href={`/dashboard/checkout?itemId=${item.id}`} variant="primary" fullWidth icon={<CreditCard className="w-4 h-4" />}>
                      Bayar Membership Sekarang
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/claims/new?itemId=${item.id}`}
                        onClick={(e) => isClaimDisabled && e.preventDefault()}
                        className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition ${
                          isClaimDisabled
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        Ajukan Klaim
                      </Link>

                      {activePlan.plan_tier !== 'extended' && (
                        <Link
                          href={`/dashboard/upgrade?itemId=${item.id}`}
                          className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                          title="Upgrade ke Extended Plan"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          Extended
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
