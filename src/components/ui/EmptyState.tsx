import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmptyState({
  icon,
  title = 'Belum ada data',
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="font-bold text-slate-900 text-base">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
