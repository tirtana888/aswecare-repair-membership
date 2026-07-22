import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, invalid, ...rest }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
          <input
            ref={ref}
            className={cn(
              'w-full pl-10 pr-3.5 py-2.5 text-sm border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              invalid ? 'border-rose-300' : 'border-slate-300',
              className
            )}
            {...rest}
          />
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          invalid ? 'border-rose-300' : 'border-slate-300',
          className
        )}
        {...rest}
      />
    )
  }
)
Input.displayName = 'Input'

export default Input
