import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Table({ className, children, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-left text-sm', className)} {...rest}>
        {children}
      </table>
    </div>
  )
}

export function Thead({ className, children, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-slate-50 border-b border-slate-200', className)} {...rest}>
      {children}
    </thead>
  )
}

export function Th({ className, children, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500', className)}
      {...rest}
    >
      {children}
    </th>
  )
}

export function Tbody({ className, children, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-slate-100', className)} {...rest}>
      {children}
    </tbody>
  )
}

export function Tr({
  className,
  clickable,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }) {
  return (
    <tr
      className={cn('transition-colors', clickable && 'cursor-pointer hover:bg-slate-50/70', className)}
      {...rest}
    >
      {children}
    </tr>
  )
}

export function Td({ className, children, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-5 py-4 text-slate-700 align-middle', className)} {...rest}>
      {children}
    </td>
  )
}

export function TableEmptyState({
  colSpan,
  icon,
  title = 'Belum ada data',
  description,
}: {
  colSpan: number
  icon?: React.ReactNode
  title?: string
  description?: string
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          {icon || <Inbox className="w-8 h-8" />}
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
        </div>
      </td>
    </tr>
  )
}

export function TableSkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-5 py-4">
              <div className="h-3.5 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + ((r + c) % 4) * 10}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
