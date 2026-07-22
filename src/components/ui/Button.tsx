'use client'

import React from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-900/10 disabled:hover:bg-primary-600',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 shadow-sm disabled:hover:bg-slate-900',
  outline:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 disabled:hover:bg-white',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:hover:bg-transparent',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm disabled:hover:bg-rose-600',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-3 text-sm gap-2 rounded-xl',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined
  }

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    className,
    children,
    ...rest
  } = props

  const isDisabled = loading || Boolean((rest as any).disabled)

  const classes = cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  )

  const content = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </>
  )

  if ('href' in props && props.href) {
    const { href, disabled, ...anchorRest } = rest as Omit<ButtonAsLink, keyof BaseProps> & { disabled?: boolean }
    if (disabled) {
      return (
        <span className={classes} aria-disabled="true">
          {content}
        </span>
      )
    }
    return (
      <Link href={props.href} className={classes} {...(anchorRest as any)}>
        {content}
      </Link>
    )
  }

  const { disabled: _disabled, ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button className={classes} disabled={isDisabled} {...buttonRest}>
      {content}
    </button>
  )
}
