import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-slate-100 rounded-md animate-pulse', className)} />
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
