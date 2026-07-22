'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Drawer({
  open,
  onClose,
  title,
  description,
  width = 'md',
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: string
  width?: 'sm' | 'md' | 'lg'
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

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full bg-white shadow-dropdown flex flex-col transition-transform duration-300',
          widthClasses[width],
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 shrink-0">
          <div>
            {title && <div className="text-base font-bold text-slate-900">{title}</div>}
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
