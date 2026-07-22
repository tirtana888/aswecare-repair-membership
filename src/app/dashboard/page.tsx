'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, Footprints, Smartphone, ShieldCheck, ShieldAlert, Clock, AlertCircle, CreditCard,
  ShoppingBag, ArrowUpCircle, Package, Zap, Wrench, CheckCircle2, ChevronRight, User, Star
} from 'lucide-react'
import { PageHeader, Card, Button, StatusBadge, EmptyState, SkeletonCardGrid } from '@/components/ui'
import { formatDateID, formatIDR } from '@/lib/utils'

export default function MemberDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMemberData()

    // Realtime Sync for instant status updates
    const itemsChannel = supabase
      .channel('member-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchMemberData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => fetchMemberData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => fetchMemberData())
      .subscribe()

    return () => {
      supabase.removeChannel(itemsChannel)
    }
  }, [])

  const fetchMemberData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    setUserProfile(user)

    // 1. Fetch Member Items & Plans
    const { data: itemsData } = await supabase
      .from('items')
      .select('*, subcategories(name, category_id)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })

    if (itemsData && itemsData.length > 0) {
      const itemIds = itemsData.map((i) => i.id)
      const { data: plansData } = await supabase.from('plans').select('*').in('item_id', itemIds)

      const mergedItems = itemsData.map((item) => {
        const itemPlans = (plansData || []).filter((p) => p.item_id === item.id)
        return { ...item, plans: itemPlans }
      })
      setItems(mergedItems)
    } else {
      setItems([])
    }

    // 2. Fetch Member Claims
    const { data: claimsData } = await supabase
      .from('claims')
      .select('*, items(brand, model), partners(name)')
      .eq('member_id', user.id)
      .order('submitted_at', { ascending: false })

    setClaims(claimsData || [])
    setLoading(false)
  }

  const getActivePlan = (item: any) =>
    item.plans && item.plans.length > 0
      ? item.plans.find((p: any) => p.status === 'active') || item.plans[item.plans.length - 1]
      : null

  // Status Badge Logic
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

  // Calculated Stats
  const totalItems = items.length
  const activePlansCount = items.filter((i) => {
    const p = getActivePlan(i)
    return p && p.status === 'active'
  }).length

  const activeClaims = claims.filter((c) => ['submitted', 'approved', 'in_service'].includes(c.status))
  const remainingQuotaSum = items.reduce((acc, i) => {
    const p = getActivePlan(i)
    if (p && p.status === 'active') {
      return acc + (p.annual_quota - p.quota_used)
    }
    return acc
  }, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. MEMBER WELCOME & STATS OVERVIEW HEADER */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Member Account Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Halo, {userProfile?.user_metadata?.full_name || userProfile?.email?.split('@')[0] || 'Member'}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola barang terproteksi, bayar keanggotaan, dan pantau status perbaikan garansi Anda.
            </p>
          </div>

          <Link href="/dashboard/items/new">
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </button>
          </Link>
        </div>

        {/* 21st.dev Glassmorphism Stats Cards (4 Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Barang Terdaftar',
              value: totalItems,
              icon: Package,
              color: 'blue',
              desc: 'Barang fisik di sistem',
            },
            {
              label: 'Polis Garansi Aktif',
              value: activePlansCount,
              icon: ShieldCheck,
              color: 'emerald',
              desc: 'Terproteksi aktif',
            },
            {
              label: 'Sisa Kuota Perbaikan',
              value: `${remainingQuotaSum} Kuota`,
              icon: Zap,
              color: 'indigo',
              desc: 'Siap digunakan ($0 fee)',
            },
            {
              label: 'Klaim Dalam Proses',
              value: activeClaims.length,
              icon: Clock,
              color: 'amber',
              desc: 'Servis sedang berjalan',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{stat.label}</span>
                <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
              <span className="text-[10px] text-slate-400 block font-medium">{stat.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE CLAIMS IN PROGRESS SECTION (If Any) */}
      {activeClaims.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl border border-slate-800"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Status Klaim Perbaikan Aktif ({activeClaims.length})</h3>
            </div>
            <Link href="/dashboard/claims" className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1">
              <span>Lihat Semua Riwayat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeClaims.map((claim) => (
              <div key={claim.id} className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm">{claim.items?.brand} {claim.items?.model}</h4>
                  <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase">
                    {claim.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">Jenis Kerusakan: <strong className="text-white">{claim.damage_type}</strong></p>
                {claim.partners && (
                  <p className="text-slate-400 text-[11px]">Mitra Servis: <span className="text-indigo-300 font-semibold">{claim.partners.name}</span></p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. MEMBER REGISTERED ITEMS GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Barang Saya</h2>
          <span className="text-xs text-slate-500">{items.length} Barang Terdaftar</span>
        </div>

        {loading ? (
          <SkeletonCardGrid count={3} />
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Footprints className="w-6 h-6" />}
              title="Belum Ada Barang Terdaftar"
              description="Daftarkan sepatu sneaker, smartphone, atau laptop Anda untuk mulai menikmati perbaikan garansi resmi."
              action={
                <Button href="/dashboard/items/new" size="sm" icon={<Plus className="w-4 h-4" />}>
                  Daftarkan Barang Pertama
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => {
              const activePlan = getActivePlan(item)
              const isWaitingPeriod = activePlan?.waiting_period_end_date && new Date(activePlan.waiting_period_end_date) > new Date()
              const isClaimDisabled = !activePlan || activePlan.status !== 'active' || isWaitingPeriod

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card hover className="p-6 space-y-5 flex flex-col justify-between h-full border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center shrink-0">
                            {item.subcategories?.name?.toLowerCase().includes('sneaker') || item.subcategories?.name?.toLowerCase().includes('fashion') ? (
                              <Footprints className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.brand} {item.model}</h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {item.subcategories?.name || 'Kategori'}
                            </p>
                          </div>
                        </div>
                        {renderStatusBadge(item)}
                      </div>

                      {/* Details Box */}
                      <div className="border-t border-b border-slate-100 py-3 text-xs space-y-2">
                        {item.purchase_channel && (
                          <div className="flex justify-between text-slate-600">
                            <span className="flex items-center gap-1 text-slate-400">
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Toko Pembelian:
                            </span>
                            <span className="font-bold text-indigo-700">{item.purchase_channel}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-slate-600">
                          <span className="text-slate-400">Sisa Kuota Tahun Ini:</span>
                          <span className="font-bold text-slate-900">
                            {activePlan ? `${activePlan.annual_quota - activePlan.quota_used}/${activePlan.annual_quota} Klaim` : 'Belum Aktif'}
                          </span>
                        </div>

                        {activePlan?.plan_end_date && (
                          <div className="flex justify-between text-slate-600">
                            <span className="text-slate-400">Masa Berlaku Polis:</span>
                            <span className="font-semibold text-slate-800">{formatDateID(activePlan.plan_end_date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment First Banner */}
                      {(!activePlan || activePlan.status !== 'active') && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-2xl space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Bayar Membership untuk Mengaktifkan</span>
                          </div>
                          <p className="text-amber-800 leading-normal">
                            Selesaikan pembayaran untuk mengaktifkan garansi $0 deductible. Assessment foto berjalan paralel oleh Admin.
                          </p>
                        </div>
                      )}

                      {/* Reviewing Banner */}
                      {activePlan && activePlan.status === 'active' && item.condition_at_signup === 'pending_review' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-[11px] rounded-2xl space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-blue-800">
                            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Lunas &amp; Peninjauan Admin (SLA 1x24 jam)</span>
                          </div>
                          <p className="text-blue-700 leading-normal">
                            Polis garansi telah aktif! Foto barang sedang diverifikasi oleh tim Admin.
                          </p>
                        </div>
                      )}

                      {/* Waiting Period Banner */}
                      {isWaitingPeriod && activePlan?.waiting_period_end_date && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-2xl flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Klaim aktif mulai <strong>{formatDateID(activePlan.waiting_period_end_date)}</strong> (Masa tunggu 14 hari)</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Buttons */}
                    <div className="pt-2">
                      {!activePlan || activePlan.status !== 'active' ? (
                        <Link href={`/dashboard/checkout?itemId=${item.id}`} className="block w-full">
                          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Bayar Membership Sekarang</span>
                          </button>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/claims/new?itemId=${item.id}`}
                            onClick={(e) => isClaimDisabled && e.preventDefault()}
                            className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition ${
                              isClaimDisabled
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            }`}
                          >
                            Ajukan Klaim
                          </Link>

                          {activePlan.plan_tier !== 'extended' && (
                            <Link
                              href={`/dashboard/upgrade?itemId=${item.id}`}
                              className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                              title="Upgrade ke Extended Plan"
                            >
                              <ArrowUpCircle className="w-4 h-4 text-purple-600" />
                              <span>Extended</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
