import React from 'react'
import {
  ShieldCheck, ShieldAlert, Clock, AlertCircle, XCircle, CheckCircle2,
  PackageSearch, Wrench, Truck, Sparkles, HelpCircle, Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ToneKey = 'success' | 'warning' | 'danger' | 'pro' | 'neutral' | 'info'

const toneClasses: Record<ToneKey, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  pro: 'bg-purple-50 text-purple-700 border-purple-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
}

interface StatusMeta {
  label: string
  tone: ToneKey
  icon: React.ComponentType<{ className?: string }>
}

// Single source of truth: every real DB status enum (+ a few UI-derived states)
// mapped to a consistent label, color and icon across member and admin surfaces.
const STATUS_MAP: Record<string, StatusMeta> = {
  // items.condition_at_signup
  pending_review: { label: 'Menunggu Review', tone: 'warning', icon: Clock },
  baru: { label: 'Kondisi Baru', tone: 'success', icon: CheckCircle2 },
  layak: { label: 'Layak Pakai', tone: 'success', icon: CheckCircle2 },
  aus_berat: { label: 'Aus Berat', tone: 'warning', icon: AlertCircle },
  rejected: { label: 'Ditolak', tone: 'danger', icon: XCircle },

  // plans.status (+ derived states used on member dashboard)
  pending_payment: { label: 'Belum Bayar', tone: 'warning', icon: Clock },
  active: { label: 'Terproteksi Aktif', tone: 'success', icon: ShieldCheck },
  expired: { label: 'Kadaluarsa', tone: 'neutral', icon: Ban },
  cancelled: { label: 'Dibatalkan', tone: 'neutral', icon: Ban },
  waiting_period: { label: 'Masa Tunggu 14 Hari', tone: 'warning', icon: ShieldAlert },
  extended: { label: 'Extended Plan', tone: 'pro', icon: Sparkles },

  // claims.status
  submitted: { label: 'Diajukan', tone: 'warning', icon: PackageSearch },
  approved: { label: 'Disetujui', tone: 'info', icon: CheckCircle2 },
  in_service: { label: 'Dalam Perbaikan', tone: 'info', icon: Wrench },
  completed: { label: 'Selesai', tone: 'success', icon: CheckCircle2 },
  delivered: { label: 'Terkirim', tone: 'success', icon: Truck },
}

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  if (!status) return { label: 'Tidak Diketahui', tone: 'neutral', icon: HelpCircle }
  return STATUS_MAP[status] || { label: status, tone: 'neutral', icon: HelpCircle }
}

export default function StatusBadge({
  status,
  label,
  className,
}: {
  status: string | null | undefined
  label?: string
  className?: string
}) {
  const meta = getStatusMeta(status)
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap',
        toneClasses[meta.tone],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label || meta.label}
    </span>
  )
}
