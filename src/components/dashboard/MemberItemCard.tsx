'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Footprints,
  Smartphone,
  ShoppingBag,
  CreditCard,
  Clock,
  ShieldAlert,
  ArrowUpCircle,
  Camera,
} from 'lucide-react'
import { Card, Button, StatusBadge } from '@/components/ui'
import { formatDateID, cn } from '@/lib/utils'
import {
  type MemberItem,
  getActivePlan,
  isWaitingPeriod,
  isClaimDisabled,
  getItemStatusKey,
} from '@/lib/member-dashboard'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MemberItemCardProps {
  item: MemberItem
  index: number
}

function SafeItemPhoto({
  src,
  alt,
  className,
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          'relative h-36 bg-slate-100 border-b border-slate-100 flex items-center justify-center',
          className
        )}
      >
        <Camera className="w-8 h-8 text-slate-300" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={cn('relative h-36 bg-slate-100 border-b border-slate-100', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        onError={() => setFailed(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  )
}

function ItemCategoryIcon({ name }: { name?: string | null }) {
  const isFashion =
    name?.toLowerCase().includes('sneaker') || name?.toLowerCase().includes('fashion')
  const Icon = isFashion ? Footprints : Smartphone
  return (
    <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5" aria-hidden="true" />
    </div>
  )
}

function QuotaProgress({ used, total }: { used: number; total: number }) {
  const remaining = Math.max(0, total - used)
  const percent = total > 0 ? (remaining / total) * 100 : 0

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Sisa Kuota Tahun Ini</span>
        <span className="font-semibold text-slate-900">
          {remaining}/{total} Klaim
        </span>
      </div>
      <div
        className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Sisa kuota ${remaining} dari ${total}`}
      >
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function MemberItemCard({ item, index }: MemberItemCardProps) {
  const reducedMotion = useReducedMotion()
  const activePlan = getActivePlan(item)
  const waiting = isWaitingPeriod(activePlan)
  const claimDisabled = isClaimDisabled(item)
  const statusKey = getItemStatusKey(item)
  const photoUrl = item.photo_urls?.[0]

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.25, delay: index * 0.04 }}
    >
      <Card hover className="overflow-hidden flex flex-col h-full">
        {photoUrl ? (
          <SafeItemPhoto src={photoUrl} alt={`Foto ${item.brand} ${item.model}`} />
        ) : null}

        <div className="p-5 flex flex-col flex-1 gap-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {!photoUrl && <ItemCategoryIcon name={item.subcategories?.name} />}
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                  {item.brand} {item.model}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.subcategories?.name || 'Kategori'}
                </p>
              </div>
            </div>
            <StatusBadge
              status={statusKey}
              label={
                statusKey === 'rejected'
                  ? 'Foto Ditolak (Revisi)'
                  : statusKey === 'pending_payment'
                    ? 'Belum Bayar Membership'
                    : undefined
              }
              className="shrink-0"
            />
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3 text-xs">
            {item.purchase_channel && (
              <div className="flex justify-between gap-2 text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500 shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                  Toko Pembelian
                </span>
                <span className="font-semibold text-primary-700 text-right truncate">
                  {item.purchase_channel}
                </span>
              </div>
            )}

            {activePlan && activePlan.status === 'active' ? (
              <QuotaProgress used={activePlan.quota_used} total={activePlan.annual_quota} />
            ) : (
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-500">Sisa Kuota Tahun Ini</span>
                <span className="font-semibold text-slate-400">Belum Aktif</span>
              </div>
            )}

            {activePlan?.plan_end_date && (
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-500">Masa Berlaku Polis</span>
                <span className="font-medium text-slate-800">
                  {formatDateID(activePlan.plan_end_date)}
                </span>
              </div>
            )}
          </div>

          {(!activePlan || activePlan.status !== 'active') && (
            <div
              className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl space-y-1"
              role="status"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Bayar Membership untuk Mengaktifkan</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Selesaikan pembayaran untuk mengaktifkan garansi $0 deductible. Assessment foto
                berjalan paralel oleh Admin.
              </p>
            </div>
          )}

          {activePlan?.status === 'active' && item.condition_at_signup === 'pending_review' && (
            <div
              className="p-3 bg-primary-50 border border-primary-200 text-primary-900 text-xs rounded-xl space-y-1"
              role="status"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                <span>Lunas &amp; Peninjauan Admin (SLA 1x24 jam)</span>
              </div>
              <p className="text-primary-700 leading-relaxed">
                Polis garansi telah aktif. Foto barang sedang diverifikasi oleh tim Admin.
              </p>
            </div>
          )}

          {waiting && activePlan?.waiting_period_end_date && (
            <div
              className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2"
              role="status"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Klaim aktif mulai{' '}
                <strong>{formatDateID(activePlan.waiting_period_end_date)}</strong> (Masa tunggu 14
                hari)
              </span>
            </div>
          )}

          <div className="mt-auto pt-1">
            {!activePlan || activePlan.status !== 'active' ? (
              <Button
                href={`/dashboard/protection-select?itemId=${item.id}`}
                fullWidth
                size="md"
                icon={<CreditCard className="w-4 h-4" />}
              >
                Pilih Proteksi &amp; Bayar
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {claimDisabled ? (
                  <Button variant="secondary" size="md" fullWidth disabled className="flex-1">
                    Ajukan Klaim
                  </Button>
                ) : (
                  <Button
                    href={`/dashboard/claims/new?itemId=${item.id}`}
                    variant="secondary"
                    size="md"
                    fullWidth
                    className="flex-1"
                  >
                    Ajukan Klaim
                  </Button>
                )}

                {activePlan.plan_tier !== 'extended' && (
                  <Button
                    href={`/dashboard/upgrade?itemId=${item.id}`}
                    variant="outline"
                    size="md"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shrink-0"
                    icon={<ArrowUpCircle className="w-4 h-4 text-purple-600" />}
                    aria-label="Upgrade ke Extended Plan"
                  >
                    Extended
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
