'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Search, Camera, ShieldCheck, ChevronLeft, ChevronRight, User, Package, Calendar, Loader2, FileText } from 'lucide-react'
import { PageHeader, StatusBadge, Tabs, Input, Textarea, EmptyState } from '@/components/ui'
import { formatDateID, formatIDR, cn } from '@/lib/utils'

interface AdminItem {
  id: string
  member_id: string
  brand: string
  model: string
  estimated_value: number
  purchase_date: string | null
  condition_at_signup: 'pending_review' | 'baru' | 'layak' | 'aus_berat' | 'rejected'
  condition_notes: string | null
  photo_urls: string[]
  created_at: string
  members?: { full_name: string; email: string; phone_number: string }
  subcategories?: { name: string }
}

const TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending_review', label: 'Menunggu' },
  { value: 'baru', label: 'Baru' },
  { value: 'layak', label: 'Layak' },
  { value: 'aus_berat', label: 'Aus Berat' },
  { value: 'rejected', label: 'Ditolak' },
]

const ASSESS_OPTIONS: { value: AdminItem['condition_at_signup']; label: string }[] = [
  { value: 'baru', label: 'Baru' },
  { value: 'layak', label: 'Layak Pakai' },
  { value: 'aus_berat', label: 'Aus Berat' },
  { value: 'rejected', label: 'Tolak (Rusak / Tidak Sesuai)' },
]

export default function ItemsPage() {
  const [items, setItems] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId])

  useEffect(() => {
    setActivePhoto(0)
    setNotes(selectedItem?.condition_notes || '')
  }, [selectedId])

  const handleAssess = async (condition_at_signup: AdminItem['condition_at_signup']) => {
    if (!selectedItem) return
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedItem.id, condition_at_signup, condition_notes: notes }),
      })
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === selectedItem.id ? { ...it, condition_at_signup, condition_notes: notes } : it))
        )
      }
    } catch (error) {
      console.error('Error updating item:', error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchTab = activeTab === 'all' || item.condition_at_signup === activeTab
    const searchLower = searchQuery.toLowerCase()
    const matchSearch =
      item.brand?.toLowerCase().includes(searchLower) ||
      item.model?.toLowerCase().includes(searchLower) ||
      item.members?.full_name?.toLowerCase().includes(searchLower)
    return matchTab && matchSearch
  })

  const tabCounts = TABS.map((t) => ({
    ...t,
    count: t.value === 'all' ? items.length : items.filter((i) => i.condition_at_signup === t.value).length,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Item Assessment"
        description="Tinjau foto barang yang didaftarkan member dan tetapkan kondisi awal sebelum proteksi aktif."
      />

      <div className="flex h-[calc(100vh-11rem)] rounded-card border border-slate-200 bg-white overflow-hidden shadow-card">
        {/* Left Panel: Queue */}
        <div className="flex w-[380px] shrink-0 flex-col border-r border-slate-200">
          <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Cari merk, model, atau nama member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Tabs items={tabCounts} value={activeTab} onChange={setActiveTab} className="border-b-0 -mx-1" />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState title="Tidak ada barang" description="Tidak ditemukan barang yang cocok dengan filter ini." />
            ) : (
              <div className="space-y-1.5">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'w-full text-left rounded-lg border p-3 transition-colors',
                      selectedId === item.id
                        ? 'border-primary-300 bg-primary-50/60 ring-1 ring-primary-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">
                        {item.brand} {item.model}
                      </h3>
                      <StatusBadge status={item.condition_at_signup} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">{item.members?.full_name || 'Member'}</span>
                      <span>{formatDateID(item.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Details */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {selectedItem ? (
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedItem.brand} {selectedItem.model}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedItem.subcategories?.name || 'Kategori'}</p>
                </div>
                <StatusBadge status={selectedItem.condition_at_signup} />
              </div>

              {/* Member info strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-400">Member</p>
                    <p className="font-semibold text-slate-800 truncate">{selectedItem.members?.full_name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-400">Estimasi Nilai</p>
                    <p className="font-semibold text-slate-800 truncate">{formatIDR(selectedItem.estimated_value)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-400">Nomor Seri / S/N</p>
                    <p className="font-semibold text-indigo-700 truncate">{selectedItem.serial_number || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-400">Struk / Nota</p>
                    {selectedItem.receipt_url ? (
                      <a
                        href={selectedItem.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-600 hover:underline truncate block"
                      >
                        Lihat Struk ↗
                      </a>
                    ) : (
                      <p className="font-semibold text-slate-400 truncate">Tidak Ada</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo viewer */}
              <div className="space-y-2">
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 relative flex items-center justify-center">
                  {selectedItem.photo_urls?.length > 0 ? (
                    <Image
                      src={selectedItem.photo_urls[activePhoto]}
                      alt={`${selectedItem.brand} ${selectedItem.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 672px"
                      className="object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-slate-300" />
                  )}
                  {selectedItem.photo_urls?.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhoto((p) => (p - 1 + selectedItem.photo_urls.length) % selectedItem.photo_urls.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition"
                        aria-label="Foto sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-700" />
                      </button>
                      <button
                        onClick={() => setActivePhoto((p) => (p + 1) % selectedItem.photo_urls.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition"
                        aria-label="Foto selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-700" />
                      </button>
                    </>
                  )}
                </div>
                {selectedItem.photo_urls?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedItem.photo_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(idx)}
                        aria-label={`Lihat foto ${idx + 1}`}
                        className={cn(
                          'w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition',
                          idx === activePhoto ? 'border-primary-500' : 'border-transparent opacity-70 hover:opacity-100'
                        )}
                      >
                        <Image src={url} width={64} height={48} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessment panel */}
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-5 space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-primary-900 text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Penilaian Kondisi Barang
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {ASSESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAssess(opt.value)}
                      disabled={updating}
                      className={cn(
                        'rounded-lg border p-3 text-sm font-semibold transition disabled:opacity-50',
                        selectedItem.condition_at_signup === opt.value
                          ? opt.value === 'rejected'
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'bg-primary-600 border-primary-600 text-white'
                          : opt.value === 'rejected'
                          ? 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50'
                          : 'bg-white border-primary-200 text-primary-700 hover:bg-primary-50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  rows={2}
                  placeholder="Catatan kondisi (opsional, wajib jika ditolak)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Camera className="w-6 h-6" />}
              title="Pilih barang untuk direview"
              description="Pilih salah satu barang dari antrean di sebelah kiri untuk melihat detail dan foto."
            />
          )}
        </div>
      </div>
    </div>
  )
}
