'use client'

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE: Record<ToastType, { icon: React.ComponentType<{ className?: string }>; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  error: { icon: XCircle, classes: 'bg-rose-50 border-rose-200 text-rose-800' },
  info: { icon: Info, classes: 'bg-slate-50 border-slate-200 text-slate-800' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => dismiss(id), 4500)
    },
    [dismiss]
  )

  const value: ToastContextValue = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const { icon: Icon, classes } = TONE[toast.type]
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-dropdown animate-in fade-in slide-in-from-bottom-2',
                classes
              )}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 opacity-60 hover:opacity-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
