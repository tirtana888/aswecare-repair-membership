import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIDR(value: number | string | null | undefined) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (!num || Number.isNaN(num)) return 'Rp 0'
  return `Rp ${num.toLocaleString('id-ID')}`
}

export function formatDateID(dateStr: string | null | undefined) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
