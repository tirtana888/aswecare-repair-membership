'use client'

import { motion } from 'framer-motion'
import { Package, ShieldCheck, Zap, Clock } from 'lucide-react'
import { StatCard } from '@/components/ui'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MemberStatGridProps {
  totalItems: number
  activePlansCount: number
  remainingQuotaSum: number
  activeClaimsCount: number
}

const stats = [
  {
    key: 'items',
    label: 'Total Barang Terdaftar',
    icon: Package,
    tone: 'primary' as const,
    trend: 'Barang fisik di sistem',
    getValue: (p: MemberStatGridProps) => p.totalItems,
  },
  {
    key: 'plans',
    label: 'Polis Garansi Aktif',
    icon: ShieldCheck,
    tone: 'success' as const,
    trend: 'Terproteksi aktif',
    getValue: (p: MemberStatGridProps) => p.activePlansCount,
  },
  {
    key: 'quota',
    label: 'Sisa Kuota Perbaikan',
    icon: Zap,
    tone: 'primary' as const,
    trend: 'Siap digunakan ($0 fee)',
    getValue: (p: MemberStatGridProps) => `${p.remainingQuotaSum} Kuota`,
  },
  {
    key: 'claims',
    label: 'Klaim Dalam Proses',
    icon: Clock,
    tone: 'warning' as const,
    trend: 'Servis sedang berjalan',
    getValue: (p: MemberStatGridProps) => p.activeClaimsCount,
  },
]

export default function MemberStatGrid(props: MemberStatGridProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.key}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.25, delay: idx * 0.06 }}
        >
          <StatCard
            label={stat.label}
            value={stat.getValue(props)}
            icon={stat.icon}
            tone={stat.tone}
            trend={stat.trend}
          />
        </motion.div>
      ))}
    </div>
  )
}
