import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
  count?: number
}

export default function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-slate-200 overflow-x-auto', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
              active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span className="flex items-center gap-1.5">
              {item.label}
              {typeof item.count === 'number' && (
                <span
                  className={cn(
                    'text-[11px] font-bold px-1.5 py-0.5 rounded-full',
                    active ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
            {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary-600 rounded-full" />}
          </button>
        )
      })}
    </div>
  )
}
