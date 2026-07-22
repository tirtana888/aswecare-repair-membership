import React from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  hover = false,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        'bg-white rounded-card border border-slate-200 shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-cardHover',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-100', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-card', className)} {...rest}>
      {children}
    </div>
  )
}

export default Card
