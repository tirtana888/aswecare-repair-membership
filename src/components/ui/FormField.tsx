import React from 'react'
import { cn } from '@/lib/utils'

export default function FormField({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label?: React.ReactNode
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  )
}
