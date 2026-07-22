'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-white rounded-xl2 shadow-dropdown border border-slate-200 max-h-[90vh] overflow-y-auto',
          sizeClasses[size]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl2">
            <div>
              {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
              {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-xl2 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
