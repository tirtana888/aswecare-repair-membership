'use client'

import { motion } from 'framer-motion'
import { Wrench, ChevronRight } from 'lucide-react'
import { Button, StatusBadge } from '@/components/ui'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface ActiveClaim {
  id: string
  status: string
  damage_type: string
  items?: { brand: string; model: string } | null
  partners?: { name: string } | null
}

interface ActiveClaimsPanelProps {
  claims: ActiveClaim[]
}

export default function ActiveClaimsPanel({ claims }: ActiveClaimsPanelProps) {
  const reducedMotion = useReducedMotion()

  if (claims.length === 0) return null

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 shadow-card border border-slate-800"
      aria-label="Klaim perbaikan aktif"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl" aria-hidden="true">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Klaim Perbaikan Aktif</h2>
            <p className="text-xs text-slate-400 mt-0.5">{claims.length} klaim sedang diproses</p>
          </div>
        </div>
        <Button
          href="/dashboard/claims"
          variant="ghost"
          size="sm"
          className="text-primary-300 hover:text-primary-200 hover:bg-slate-800 px-0 sm:px-3 gap-1"
        >
          Lihat Semua Riwayat
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {claims.map((claim) => (
          <article
            key={claim.id}
            className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2.5"
          >
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-bold text-white text-sm leading-snug">
                {claim.items?.brand} {claim.items?.model}
              </h3>
              <StatusBadge status={claim.status} className="shrink-0 bg-slate-900/50 border-slate-600" />
            </div>
            <p className="text-slate-400 text-xs">
              Jenis Kerusakan:{' '}
              <span className="text-slate-200 font-medium">{claim.damage_type}</span>
            </p>
            {claim.partners && (
              <p className="text-slate-400 text-xs">
                Mitra Servis:{' '}
                <span className="text-primary-300 font-medium">{claim.partners.name}</span>
              </p>
            )}
          </article>
        ))}
      </div>
    </motion.section>
  )
}
