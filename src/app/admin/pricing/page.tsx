'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Power, PowerOff, Save, Clock, Zap, Layers, Trash2, Tag } from 'lucide-react'
import { PageHeader, Card, CardHeader, CardBody, Button, FormField, Input, Select, EmptyState, useToast } from '@/components/ui'
import { formatIDR, cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface Subcategory {
  id: string
  category_id: string
  name: string
}

interface Tier {
  id: string
  name: string
  plan_tier: string
  category_id?: string | null
  subcategory_id?: string | null
  categories?: { name: string } | null
  subcategories?: { name: string } | null
  duration_months: number
  bonus_months: number
  bonus_quota: number
  waiting_period_days: number
  original_price: number
  price: number
  discount_percentage: number
  admin_fee: number
  is_active: boolean
}

export default function PricingPage() {
  const toast = useToast()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    plan_tier: 'basic',
    category_id: '',
    subcategory_id: '',
    duration_months: 12,
    bonus_months: 0,
    bonus_quota: 0,
    waiting_period_days: 14,
    original_price: 0,
    price: 0,
    admin_fee: 0,
  })

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pricing')
      if (res.ok) {
        const json = await res.json()
        if (json.tiers) {
          setTiers(json.tiers)
          setCategories(json.categories || [])
          setSubcategories(json.subcategories || [])
        } else if (Array.isArray(json)) {
          setTiers(json)
        }
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const discountPercentage = formData.original_price > 0
    ? ((formData.original_price - formData.price) / formData.original_price) * 100
    : 0

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id || null,
          subcategory_id: formData.subcategory_id || null,
          discount_percentage: discountPercentage,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        fetchTiers()
        setFormData({
          name: '', plan_tier: 'basic', category_id: '', subcategory_id: '',
          duration_months: 12, bonus_months: 0, bonus_quota: 0, waiting_period_days: 14, original_price: 0, price: 0, admin_fee: 0
        })
        toast.success('Paket harga baru berhasil disimpan!')
      } else {
        toast.error(data.message || 'Gagal menyimpan paket harga')
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan paket harga')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })

      if (res.ok) {
        fetchTiers()
        toast.success(currentStatus ? 'Paket dinonaktifkan' : 'Paket diaktifkan')
      } else {
        toast.error('Gagal mengubah status paket')
      }
    } catch (err) {
      toast.error('Gagal mengubah status paket')
    }
  }

  const handleDeleteTier = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTiers()
        toast.success('Paket berhasil dihapus')
      } else {
        toast.error('Gagal menghapus paket')
      }
    } catch (err) {
      toast.error('Gagal menghapus paket')
    }
  }

  const formatPercent = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + '%'

  const filteredSubcategories = formData.category_id
    ? subcategories.filter(sc => sc.category_id === formData.category_id)
    : subcategories

  return (
    <div className="space-y-8">
      <PageHeader title="Paket &amp; Harga (Per Kategori &amp; Subkategori)" description="Atur paket proteksi khusus per kategori/subkategori produk (misal: Smartphone vs Sneaker), diskon, biaya admin, serta masa tenggang." />

      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardHeader>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" /> Buat Paket Baru Spesifik Kategori / Subkategori
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Nama Paket" className="col-span-full">
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Paket Garansi Smartphone 12 Bulan (Tanpa Masa Tunggu)"
              />
            </FormField>

            {/* Selection for Category */}
            <FormField label="Kategori Utama Target">
              <Select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
              >
                <option value="">🌐 Semua Kategori (Global)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </FormField>

            {/* Selection for Subcategory */}
            <FormField label="Subkategori Spesifik Target">
              <Select
                value={formData.subcategory_id}
                onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
              >
                <option value="">📱/👟 Semua Subkategori</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Tingkat Paket">
              <Select value={formData.plan_tier} onChange={(e) => setFormData({ ...formData, plan_tier: e.target.value })}>
                <option value="basic">Basic</option>
                <option value="extended">Extended</option>
              </Select>
            </FormField>

            <FormField label="Durasi (Bulan)">
              <Select value={formData.duration_months} onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}>
                <option value={3}>3 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={9}>9 Bulan</option>
                <option value={12}>12 Bulan</option>
              </Select>
            </FormField>

            <FormField label="Masa Tenggang (Waiting Period)">
              <Select
                value={formData.waiting_period_days}
                onChange={(e) => setFormData({ ...formData, waiting_period_days: Number(e.target.value) })}
              >
                <option value={0}>0 Hari (Tanpa Masa Tunggu / Instant)</option>
                <option value={7}>7 Hari</option>
                <option value={14}>14 Hari (Standar BI)</option>
                <option value={30}>30 Hari</option>
              </Select>
            </FormField>

            <FormField label="Bonus Bulan">
              <Input type="number" min={0} value={formData.bonus_months} onChange={(e) => setFormData({ ...formData, bonus_months: Number(e.target.value) })} />
            </FormField>

            <FormField label="Bonus Kuota (Klaim)">
              <Input type="number" min={0} value={formData.bonus_quota} onChange={(e) => setFormData({ ...formData, bonus_quota: Number(e.target.value) })} />
            </FormField>

            <FormField label="Harga Coret (Asli)">
              <Input type="number" min={0} value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })} />
            </FormField>

            <FormField label="Harga Jual">
              <Input type="number" min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
            </FormField>

            <FormField label="Biaya Admin">
              <Input type="number" min={0} value={formData.admin_fee} onChange={(e) => setFormData({ ...formData, admin_fee: Number(e.target.value) })} />
            </FormField>

            <FormField label="Diskon (Auto)">
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600 font-semibold">
                {formatPercent(discountPercentage)}
              </div>
            </FormField>

            <div className="col-span-full mt-1">
              <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
                Simpan Paket Baru
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 rounded-card bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <Card><EmptyState title="Belum ada paket harga" description="Buat paket harga baru menggunakan formulir di atas." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const catName = tier.categories?.name
            const subcatName = tier.subcategories?.name
            const targetLabel = subcatName ? `${catName ? catName + ' - ' : ''}${subcatName}` : catName || 'Semua Kategori (Global)'

            return (
              <Card key={tier.id} hover className={cn('p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4', !tier.is_active && 'opacity-60')}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                          tier.plan_tier === 'basic' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                        )}
                      >
                        {tier.plan_tier}
                      </span>

                      {/* Target Category Badge */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-600" />
                        <span>{targetLabel}</span>
                      </span>

                      {/* Masa Tenggang Badge */}
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border",
                        (tier.waiting_period_days || 14) === 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}>
                        {(tier.waiting_period_days || 14) === 0 ? (
                          <>
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>0 Hari</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{tier.waiting_period_days || 14} Hari</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2">{tier.name}</h3>
                    <p className="text-xs text-slate-500">
                      {tier.duration_months} Bulan {tier.bonus_months > 0 && `+ ${tier.bonus_months} Bln`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(tier.id, tier.is_active)}
                      className={cn(
                        'w-8 h-8 inline-flex items-center justify-center rounded-full transition-colors',
                        tier.is_active ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                      )}
                      title={tier.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {tier.is_active ? <Power size={14} /> : <PowerOff size={14} />}
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id, tier.name)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Hapus Paket"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-sm">
                  {tier.original_price > tier.price && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Harga Asli</span>
                      <span className="line-through text-slate-400">{formatIDR(tier.original_price)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Harga Jual</span>
                    <span className="font-bold text-slate-900">{formatIDR(tier.price)}</span>
                  </div>
                  {tier.discount_percentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Diskon</span>
                      <span className="font-semibold text-emerald-600">{formatPercent(tier.discount_percentage)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md">
                    Kuota Bonus: {tier.bonus_quota}x
                  </span>
                  <span className="text-slate-500 font-medium">
                    Target: <strong className="text-slate-800">{targetLabel}</strong>
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
