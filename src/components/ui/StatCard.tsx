import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'pro' | 'neutral'

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  pro: 'bg-purple-50 text-purple-600',
  neutral: 'bg-slate-100 text-slate-600',
}

export default function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  trend,
  className,
}: {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  tone?: Tone
  trend?: string
  className?: string
}) {
  const Icon = icon
  return (
    <Card hover className={cn('p-5 flex items-start gap-4', className)}>
      <div className={cn('p-3 rounded-xl shrink-0', toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 mb-1 truncate">{label}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {trend && <p className="text-[11px] text-slate-400 mt-1">{trend}</p>}
      </div>
    </Card>
  )
}
