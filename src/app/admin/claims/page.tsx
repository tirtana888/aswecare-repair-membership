'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
  PenTool, CheckCircle, Package, Info, TrendingUp, CircleDollarSign,
  AlertCircle, Loader2, User, Wrench,
} from 'lucide-react'
import {
  PageHeader, StatusBadge, Tabs, StatCard, Select, Input, Textarea, Button, EmptyState, ConfirmDialog, useToast,
} from '@/components/ui'
import { formatIDR, formatDateID, cn } from '@/lib/utils'

interface Claim {
  id: string
  member_id: string
  item_id: string
  damage_type: string
  description: string | null
  photo_urls: string[]
  status: 'submitted' | 'approved' | 'rejected' | 'in_service' | 'completed' | 'delivered'
  rejection_reason: string | null
  assigned_partner_id: string | null
  actual_service_cost: number | null
  submitted_at: string
  resolved_at: string | null
  members?: { full_name: string; email: string; phone_number: string }
  items?: { brand: string; model: string }
  partners?: { id: string; name: string } | null
}

interface Partner {
  id: string
  name: string
}

const TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'submitted', label: 'Masuk' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'in_service', label: 'Servis' },
  { value: 'completed', label: 'Selesai' },
  { value: 'delivered', label: 'Terkirim' },
  { value: 'rejected', label: 'Ditolak' },
]

export default function ClaimsPage() {
  const toast = useToast()
  const [claims, setClaims] = useState<Claim[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [costInput, setCostInput] = useState('')
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/claims')
      if (res.ok) {
        const data = await res.json()
        setClaims(data.claims || [])
        setPartners(data.partners || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const selectedClaim = useMemo(() => claims.find((c) => c.id === selectedId) || null, [claims, selectedId])

  useEffect(() => {
    if (selectedClaim) {
      setCostInput(selectedClaim.actual_service_cost?.toString() || '')
      setSelectedPartnerId(selectedClaim.assigned_partner_id || '')
      setRejectReason(selectedClaim.rejection_reason || '')
    }
  }, [selectedId])

  const patchClaim = async (payload: Partial<Claim> & { claimId: string }) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setClaims((prev) => prev.map((c) => (c.id === payload.claimId ? { ...c, ...payload } as Claim : c)))
      } else {
        toast.error('Gagal memperbarui klaim')
      }
    } catch (e) {
      console.error(e)
      toast.error('Gagal memperbarui klaim')
    } finally {
      setUpdating(false)
    }
  }

  const updateStatus = (status: Claim['status'], extra: Record<string, any> = {}) => {
    if (!selectedClaim) return
    patchClaim({ claimId: selectedClaim.id, status, ...extra })
  }

  const confirmDecision = () => {
    if (pendingDecision === 'approved') {
      updateStatus('approved')
    } else if (pendingDecision === 'rejected') {
      updateStatus('rejected', { rejection_reason: rejectReason.trim() })
    }
    setPendingDecision(null)
  }

  const saveAssignmentAndCost = () => {
    if (!selectedClaim) return
    patchClaim({
      claimId: selectedClaim.id,
      status: 'in_service',
      assigned_partner_id: selectedPartnerId,
      actual_service_cost: parseInt(costInput) || 0,
    })
  }

  const filteredClaims = activeTab === 'all' ? claims : claims.filter((c) => c.status === activeTab)
  const tabCounts = TABS.map((t) => ({
    ...t,
    count: t.value === 'all' ? claims.length : claims.filter((c) => c.status === t.value).length,
  }))

  const completedClaims = claims.filter((c) => c.actual_service_cost && c.actual_service_cost > 0)
  const avgCost = completedClaims.length > 0
    ? completedClaims.reduce((acc, c) => acc + (c.actual_service_cost || 0), 0) / completedClaims.length
    : 0
  const inServiceCount = claims.filter((c) => c.status === 'in_service').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Klaim Servis"
        description="Kelola alur kerja klaim perbaikan dari pengajuan hingga barang dikirim kembali ke member."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Klaim" value={claims.length} icon={TrendingUp} tone="primary" />
        <StatCard label="Rata-rata Biaya Servis" value={formatIDR(avgCost)} icon={CircleDollarSign} tone="success" />
        <StatCard label="Dalam Proses Servis" value={inServiceCount} icon={AlertCircle} tone="warning" />
      </div>

      <div className="flex h-[calc(100vh-22rem)] min-h-[420px] rounded-card border border-slate-200 bg-white overflow-hidden shadow-card">
        {/* Left Panel: List */}
        <div className="flex w-[380px] shrink-0 flex-col border-r border-slate-200">
          <div className="p-4 border-b border-slate-100 shrink-0">
            <Tabs items={tabCounts} value={activeTab} onChange={setActiveTab} className="border-b-0" />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : filteredClaims.length === 0 ? (
              <EmptyState title="Tidak ada klaim" description="Belum ada klaim pada kategori ini." />
            ) : (
              <div className="space-y-1.5">
                {filteredClaims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedId(claim.id)}
                    className={cn(
                      'w-full text-left rounded-lg border p-3 transition-colors',
                      selectedId === claim.id
                        ? 'border-primary-300 bg-primary-50/60 ring-1 ring-primary-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {claim.items?.brand} {claim.items?.model}
                      </span>
                      <StatusBadge status={claim.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">{claim.members?.full_name}</span>
                      <span>{formatDateID(claim.submitted_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Detail */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {selectedClaim ? (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedClaim.items?.brand} {selectedClaim.items?.model}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Klaim dari {selectedClaim.members?.full_name}
                  </p>
                </div>
                <StatusBadge status={selectedClaim.status} />
              </div>

              <div className="bg-white p-4 rounded-xl text-sm text-slate-700 border border-slate-200">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">
                  Kerusakan: {selectedClaim.damage_type}
                </p>
                <p>{selectedClaim.description || 'Tidak ada deskripsi tambahan.'}</p>
              </div>

              {selectedClaim.photo_urls?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selectedClaim.photo_urls.map((url, idx) => (
                    <Image key={idx} src={url} alt="" width={96} height={80} className="w-24 h-20 object-cover rounded-lg border border-slate-200 shrink-0" />
                  ))}
                </div>
              )}

              {/* Workflow Actions based on status */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                {selectedClaim.status === 'submitted' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800 text-sm">Tinjau Pengajuan Klaim</h3>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Alasan Penolakan <span className="text-slate-400 font-normal">(wajib diisi jika menolak)</span>
                      </label>
                      <Textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Contoh: Kerusakan di luar cakupan proteksi membership"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" fullWidth loading={updating} onClick={() => setPendingDecision('approved')}>
                        Setujui Klaim
                      </Button>
                      <Button
                        variant="danger"
                        fullWidth
                        loading={updating}
                        disabled={!rejectReason.trim()}
                        onClick={() => setPendingDecision('rejected')}
                      >
                        Tolak Klaim
                      </Button>
                    </div>
                  </div>
                )}

                {selectedClaim.status === 'approved' && (
                  <div className="space-y-3.5">
                    <h3 className="font-semibold text-slate-800 text-sm">Tugaskan ke Mitra Servis</h3>
                    <Select value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)}>
                      <option value="">-- Pilih Mitra --</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">Estimasi Biaya (Rp)</label>
                      <Input
                        type="number"
                        value={costInput}
                        onChange={(e) => setCostInput(e.target.value)}
                        placeholder="Contoh: 150000"
                      />
                    </div>
                    <Button
                      variant="primary"
                      fullWidth
                      loading={updating}
                      disabled={!selectedPartnerId || !costInput}
                      onClick={saveAssignmentAndCost}
                    >
                      Mulai Proses Servis
                    </Button>
                  </div>
                )}

                {selectedClaim.status === 'in_service' && (
                  <div className="space-y-3.5">
                    <div className="bg-primary-50 text-primary-800 p-4 rounded-lg flex items-start gap-3">
                      <PenTool className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold">Sedang Diservis</p>
                        <p className="opacity-90 text-xs mt-0.5">
                          Mitra: {partners.find((p) => p.id === selectedClaim.assigned_partner_id)?.name || '-'}
                        </p>
                        <p className="opacity-90 text-xs">Biaya: {formatIDR(selectedClaim.actual_service_cost)}</p>
                      </div>
                    </div>
                    <Button variant="primary" fullWidth loading={updating} onClick={() => updateStatus('completed')}>
                      <Wrench className="w-4 h-4" />
                      Tandai Servis Selesai
                    </Button>
                  </div>
                )}

                {selectedClaim.status === 'completed' && (
                  <div className="space-y-3.5">
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-start gap-3">
                      <Package className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold">Servis Selesai</p>
                        <p className="opacity-90 text-xs mt-0.5">Barang siap dikirim kembali ke pelanggan.</p>
                      </div>
                    </div>
                    <Button variant="secondary" fullWidth loading={updating} onClick={() => updateStatus('delivered')}>
                      Tandai Sudah Terkirim
                    </Button>
                  </div>
                )}

                {selectedClaim.status === 'delivered' && (
                  <div className="bg-slate-50 text-slate-700 p-4 rounded-lg flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p className="text-sm font-medium">Klaim telah selesai sepenuhnya.</p>
                  </div>
                )}

                {selectedClaim.status === 'rejected' && (
                  <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm">
                    <p className="font-semibold mb-1">Klaim Ditolak</p>
                    <p className="text-xs opacity-90">{selectedClaim.rejection_reason || 'Tidak memenuhi ketentuan proteksi.'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Info className="w-6 h-6" />}
              title="Pilih klaim untuk direview"
              description="Pilih salah satu klaim dari daftar untuk melihat detail dan mengubah status."
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDecision !== null}
        onClose={() => setPendingDecision(null)}
        onConfirm={confirmDecision}
        loading={updating}
        danger={pendingDecision === 'rejected'}
        title={pendingDecision === 'approved' ? 'Setujui klaim ini?' : 'Tolak klaim ini?'}
        description={
          pendingDecision === 'approved'
            ? 'Member akan diarahkan ke tahap penugasan mitra servis.'
            : `Member akan menerima alasan penolakan: "${rejectReason.trim()}"`
        }
        confirmLabel={pendingDecision === 'approved' ? 'Ya, Setujui' : 'Ya, Tolak Klaim'}
      />
    </div>
  )
}
