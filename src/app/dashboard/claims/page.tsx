'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Wrench, CheckCircle2, Star, Clock, ShieldCheck, AlertCircle, MapPin, DollarSign } from 'lucide-react'
import { PageHeader, Card, EmptyState } from '@/components/ui'
import { cn, formatIDR, formatDateID } from '@/lib/utils'

const TIMELINE_STAGES = [
  { key: 'submitted', label: 'Diajukan' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'in_service', label: 'Dalam Servis' },
  { key: 'completed', label: 'Selesai' },
  { key: 'delivered', label: 'Diterima' },
]

export default function MemberClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchClaims()
    const channel = supabase
      .channel('claims-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => {
        fetchClaims()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchClaims = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('claims')
      .select(`
        *,
        items (
          brand,
          model,
          subcategories (name)
        ),
        partners (name, location_area)
      `)
      .eq('member_id', user.id)
      .order('submitted_at', { ascending: false })

    setClaims(data || [])
    setLoading(false)
  }

  const handleRating = async (claimId: string, rating: number) => {
    await supabase.from('claims').update({ member_rating: rating }).eq('id', claimId)
    fetchClaims()
  }

  const getStageIndex = (status: string) => {
    if (status === 'rejected') return -1
    return TIMELINE_STAGES.findIndex((s) => s.key === status)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Card className="p-6 border border-slate-200/80 shadow-xs">
        <PageHeader
          title="Riwayat &amp; Status Klaim"
          description="Pantau progres perbaikan barang Anda secara real-time dari pengajuan hingga barang diserahkan kembali."
        />
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Wrench className="w-6 h-6" />}
            title="Belum Ada Klaim Diajukan"
            description="Anda belum memiliki riwayat pengajuan servis perbaikan."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {claims.map((claim, idx) => {
            const currentStageIdx = getStageIndex(claim.status)
            const isRejected = claim.status === 'rejected'

            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
              >
                <Card className="p-6 space-y-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all rounded-3xl">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {claim.items?.subcategories?.name || 'Garansi'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        {claim.items?.brand} {claim.items?.model}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        Kerusakan: {claim.damage_type}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Diajukan: {formatDateID(claim.submitted_at)}
                      </span>
                    </div>
                  </div>

                  {/* Rejected Banner */}
                  {isRejected ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl space-y-1">
                      <strong className="block text-rose-900 font-bold">Klaim Ditolak oleh System / Admin</strong>
                      <p>{claim.rejection_reason || 'Kerusakan tidak memenuhi syarat polis garansi.'}</p>
                    </div>
                  ) : (
                    /* Timeline Stages */
                    <div className="py-2">
                      <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />

                        {TIMELINE_STAGES.map((stage, sIdx) => {
                          const isDone = sIdx <= currentStageIdx
                          const isCurrent = sIdx === currentStageIdx

                          return (
                            <div key={stage.key} className="relative z-10 flex flex-col items-center bg-white px-2">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                                  isDone ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                )}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                              </div>
                              <span className={cn('text-[11px] mt-2 font-semibold', isCurrent ? 'text-indigo-600 font-bold' : 'text-slate-500')}>
                                {stage.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Partner Assignment Box */}
                  {claim.partners && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Mitra Servis Ditugaskan:</span>
                        <span className="font-bold text-slate-900">{claim.partners.name}</span>
                        {claim.partners.location_area && <span className="text-slate-500"> ({claim.partners.location_area})</span>}
                      </div>
                      {claim.actual_service_cost && (
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Biaya Servis Ditanggung:</span>
                          <span className="font-extrabold text-emerald-600">{formatIDR(claim.actual_service_cost)} ($0 Deductible)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rating Prompt */}
                  {claim.status === 'delivered' && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Beri Rating Servis Perbaikan:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(claim.id, star)}
                            className={cn(
                              'p-1 rounded transition transform hover:scale-110',
                              (claim.member_rating || 0) >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
                            )}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
