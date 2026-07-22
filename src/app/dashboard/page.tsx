'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Footprints, User } from 'lucide-react'
import { PageHeader, Card, Button, EmptyState, SkeletonCardGrid } from '@/components/ui'
import MemberStatGrid from '@/components/dashboard/MemberStatGrid'
import ActiveClaimsPanel from '@/components/dashboard/ActiveClaimsPanel'
import MemberItemCard from '@/components/dashboard/MemberItemCard'
import { getActivePlan, type MemberItem } from '@/lib/member-dashboard'

export default function MemberDashboard() {
  const [items, setItems] = useState<MemberItem[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMemberData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setUserProfile(user)

      const { data: itemsData } = await supabase
        .from('items')
        .select('*, subcategories(name, category_id)')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })

      if (itemsData && itemsData.length > 0) {
        const itemIds = itemsData.map((i) => i.id)
        const { data: plansData } = await supabase.from('plans').select('*').in('item_id', itemIds)

        const mergedItems = itemsData.map((item) => ({
          ...item,
          plans: (plansData || []).filter((p) => p.item_id === item.id),
        }))
        setItems(mergedItems)
      } else {
        setItems([])
      }

      const { data: claimsData } = await supabase
        .from('claims')
        .select('*, items(brand, model), partners(name)')
        .eq('member_id', user.id)
        .order('submitted_at', { ascending: false })

      setClaims(claimsData || [])
      setLoading(false)
    }

    fetchMemberData()

    const channel = supabase
      .channel('member-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () =>
        fetchMemberData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () =>
        fetchMemberData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () =>
        fetchMemberData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const totalItems = items.length
  const activePlansCount = items.filter((i) => {
    const p = getActivePlan(i)
    return p && p.status === 'active'
  }).length

  const activeClaims = claims.filter((c) =>
    ['submitted', 'approved', 'in_service'].includes(c.status)
  )

  const remainingQuotaSum = items.reduce((acc, i) => {
    const p = getActivePlan(i)
    if (p && p.status === 'active') {
      return acc + (p.annual_quota - p.quota_used)
    }
    return acc
  }, 0)

  const displayName =
    userProfile?.user_metadata?.full_name ||
    userProfile?.email?.split('@')[0] ||
    'Member'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="space-y-6">
        <div className="border-b border-slate-100 pb-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold">
            <User className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Member Dashboard</span>
          </div>

          <PageHeader
            title={`Halo, ${displayName}`}
            description="Kelola barang terproteksi, bayar keanggotaan, dan pantau status perbaikan garansi Anda."
            action={
              <Button
                href="/dashboard/items/new"
                icon={<Plus className="w-4 h-4" />}
              >
                Tambah Barang Baru
              </Button>
            }
          />
        </div>

        <MemberStatGrid
          totalItems={totalItems}
          activePlansCount={activePlansCount}
          remainingQuotaSum={remainingQuotaSum}
          activeClaimsCount={activeClaims.length}
        />
      </section>

      <ActiveClaimsPanel claims={activeClaims} />

      <section className="space-y-4" aria-labelledby="items-heading">
        <div className="flex justify-between items-center">
          <h2 id="items-heading" className="text-lg font-bold text-slate-900 tracking-tight">
            Daftar Barang Saya
          </h2>
          <span className="text-xs text-slate-500">{items.length} barang terdaftar</span>
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
            {items.map((item, idx) => (
              <MemberItemCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
